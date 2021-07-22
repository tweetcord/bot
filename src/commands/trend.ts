import { CommandInteraction, MessageEmbed, MessageEmbedOptions } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";
import { woeidObject } from "../components/Types";
import { inlineCode, time } from "@discordjs/builders";
export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "trend"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<any> {
        // TODO: Add button support with search tweet command
        await interaction.defer()
        const country = interaction.options.get("country")?.value
        try {
            const woeid = await this.woeid(country)
            const data = await this.bot.twitter.get("trends/place", {
                id: woeid?.woeid
            })
            console.log(woeid)
            const trend = data[0];
            const embed: MessageEmbedOptions = {
                author: {
                    name: `Trends in ${woeid?.placeType.code === 12 ? woeid?.name : `${woeid?.name}, ${woeid?.country}`}`
                },
                description: trend.trends.slice(0, 10).map((t: { name: string; url: URL; }) => `[${t.name}](${t.url})`).join("\n"),
                timestamp: Date.now(),
                footer: {
                    text: `${woeid?.placeType.name} - WOEID is ${woeid?.woeid}`
                },
                fields: [
                    {
                        name: "Oldest trend created at",
                        value: time(Date.parse(trend.created_at) / 1000, "F"),
                        inline: true
                    },
                    {
                        name: "List created at",
                        value: time(Date.parse(trend.as_of) / 1000, "F"),
                        inline: true
                    }
                ]

            }
            await interaction.editReply({ embeds: [embed] })
        } catch (e) {
            if (e.errors[0].code === 34) return interaction.editReply({ content: `No trends found for ${inlineCode(country as string)}` })
            else console.error(e)
        }
    }
    private async woeid(input: any): Promise<woeidObject | undefined> {
        input = input.toLowerCase()
        const data: woeidObject[] = await this.bot.twitter.get("trends/available")
        return data.find(t =>
            t.countryCode?.toUpperCase() === input ||
            t.name?.toLowerCase().includes(input) ||
            t.woeid == Number(input) ||
            t.country?.toLowerCase().includes(input)
        )
    }
}