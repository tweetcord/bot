import { CommandInteraction, Formatters, MessageActionRow, MessageEmbedOptions } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";
import { TrendObject, woeidObject } from "../components/Types";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "trend"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<any> {
        await interaction?.defer()
        const country = interaction.options.get("country")?.value
        try {
            const woeid = await this.woeid(country as string)
            const data = await this.bot.twitter.get("trends/place", {
                id: woeid?.woeid
            })
            const trend = data[0];
            const trends: TrendObject[] = trend.trends.filter((v: TrendObject, i: number, a: TrendObject[]) => a.findIndex(t => (t.name === v.name)) === i)
            const embed: MessageEmbedOptions = {
                color: "BLURPLE",
                author: {
                    name: `Trends in ${woeid?.placeType.code === 12 ? woeid?.name : `${woeid?.name}${woeid?.country ? "," : ""} ${woeid?.country}`}`,
                    iconURL: "https://abs.twimg.com/favicons/twitter.ico",
                    url: "https://twitter.com/i/trends"
                },
                description: Formatters.blockQuote(trends.slice(0, 10).map(t => `[${t.name}](${t.url})`).join("\n")),
                timestamp: Date.now(),
                footer: {
                    text: `${woeid?.placeType.name ?? "Unknown place type"} \u2022 WOEID is ${woeid?.woeid}`
                },
                fields: [
                    {
                        name: "Oldest trend created at",
                        value: Formatters.time(Date.parse(trend.created_at) / 1000, "F"),
                        inline: true
                    },
                    {
                        name: "List created at",
                        value: Formatters.time(Date.parse(trend.as_of) / 1000, "F"),
                        inline: true
                    }
                ]
            }
            if (woeid?.countryCode) Object.assign(embed, {
                thumbnail: {
                    url: `https://www.countryflags.io/${woeid?.countryCode.toLowerCase()}/flat/64.png`
                }
            })
            const buttons = new MessageActionRow().addComponents(
                {
                    style: "LINK",
                    type: "BUTTON",
                    url: "https://twitter.com/i/trends",
                    label: "See your trends"
                },
                {
                    style: "LINK",
                    type: "BUTTON",
                    url: "https://twitter.com/settings/trends/location",
                    label: "Change your trends location"
                }
            )
            await interaction.editReply({ embeds: [embed], components: [buttons] })
        } catch (e) {
            const support = new MessageActionRow().addComponents({
                style: "LINK",
                type: "BUTTON",
                url: "https://discord.gg/2n4qCXTuc7",
                label: "Join support server"
            })
            if (e?.errors?.[0].code === 34) {
                return interaction.editReply({ content: `No trends found for ${Formatters.inlineCode(country as string)}` })
            } else {
                console.error(e.stack)
                return interaction.editReply({
                    content: `An error occurred. Please join support server and report this error: ${Formatters.codeBlock("js", e.message)}`,
                    components: [support]
                })
            }
        }
    }
    private async woeid(input: string): Promise<woeidObject | undefined> {
        // TODO: Fix search bugs
        input = input.toLowerCase()
        const data: woeidObject[] = await this.bot.twitter.get("trends/available")
        return data.find(t => {
            if (input.length == 2 || input.length === 3) {
                return t.countryCode === input.toUpperCase()
            } else if (!Number.isNaN(input)) {
                return t.woeid === Number(input)
            } else {
                return t.name?.toLowerCase() === input.toLowerCase() ||
                    t.country?.toLowerCase() === input.toLowerCase() ||
                    t.country?.toLowerCase().includes(input.toLowerCase()) ||
                    t.name?.toLowerCase().includes(input.toLowerCase())
            }
        })
    }
}