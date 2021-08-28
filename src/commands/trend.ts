import { CommandInteraction, Formatters, MessageActionRow, MessageEmbedOptions } from "discord.js";
import { TrendV1 } from "twitter-api-v2";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "trend"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<any> {
        await interaction?.deferReply()
        const country = interaction.options.getString("country", true)
        try {
            const woeid = await this.woeid(country)
            const data = await this.bot.twitter.v1.trendsByPlace(woeid?.woeid!)
            const trend = data[0];
            const trends: TrendV1[] = trend.trends.filter((v: TrendV1, i: number, a: TrendV1[]) => a.findIndex(t => (t.name === v.name)) === i)
            const embed: MessageEmbedOptions = {
                color: "BLURPLE",
                author: {
                    name: `Trends in ${woeid?.placeType?.code === 12 ? woeid?.name : `${woeid?.name}${woeid?.country ? "," : ""} ${woeid?.country}`}`,
                    iconURL: "https://abs.twimg.com/favicons/twitter.ico",
                    url: "https://twitter.com/i/trends"
                },
                description: Formatters.blockQuote(trends.slice(0, 10).map(t => `[${t.name}](${t.url})`).join("\n")),
                timestamp: Date.now(),
                footer: {
                    text: `${woeid?.placeType?.name ?? "Unknown place type"} \u2022 WOEID is ${woeid?.woeid}`
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
        } catch (err: any) {
            const support = new MessageActionRow().addComponents({
                style: "LINK",
                type: "BUTTON",
                url: "https://discord.gg/2n4qCXTuc7",
                label: "Join support server"
            })
            if (err?.errors?.[0].code === 34) {
                return interaction.editReply({ content: `No trends found for ${Formatters.inlineCode(country as string)}` })
            } else {
                console.error(err.stack)
                return interaction.editReply({
                    content: `An error occurred. Please join support server and report this error: ${Formatters.codeBlock("js", err.message)}`,
                    components: [support]
                })
            }
        }
    }
    private async woeid(input: string): Promise<any> {
        const data = await this.bot.twitter.v1.trendsAvailable()
        for (const d of data) {
            if (d.name.toLowerCase() === input.toLowerCase()) return d;
            if (d.country?.toLowerCase() === input.toLowerCase()) return d;
            if (d.countryCode?.toLowerCase() === input.toLowerCase()) return d;
            if (!Number.isNaN(input) && Number(input) === d.woeid) return d;
        }
    }
}