import { Collection, CommandInteraction, Message, MessageActionRow, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Search extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "search"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | void> {
        await interaction?.deferReply()
        if (interaction.options.getSubcommand() === "tweet") {
            const data = await this.bot.twitter.v2.search(interaction.options.getString("text", true))
            const statuses = data.tweets
            if (statuses.length === 0) return interaction.reply({ content: "No results found", ephemeral: true })
            const tweets = statuses.slice(0, statuses.length > 25 ? 25 : statuses.length)
            const options: MessageSelectOptionData[] = tweets.map((u, i) => {
                return Object.assign({}, {
                    label: `${u.text.startsWith("RT") ? "🔁" : ""} ${data.includes.users?.at(0)?.username}`,
                    description: u.text?.length === 0 ? "No description" : (u.text?.length > 100 ? u.text?.substring(0, 99) + "\u2026" : u.text),
                    value: (++i).toString()
                })
            })
            const row = new MessageActionRow().addComponents({
                type: "SELECT_MENU",
                placeholder: `Click me! (${tweets.length} results)`,
                customId: "tweets",
                options
            })
            await interaction.editReply({ content: "Select user below", components: [row] })

            const filter = (i: SelectMenuInteraction) => i.user.id === interaction?.user.id
            const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60e3 })

            collector?.on("collect", (i: SelectMenuInteraction) => {
                if (i.customId === "tweets") {
                    i.deferUpdate()
                    const tweet = tweets.at(Number(i.values.at(0)) - 1)
                    i.followUp({ content: `https://twitter.com/i/web/status/${tweet?.id}`, ephemeral: true })
                }
            })
            collector?.on("end", (collected: Collection<string, SelectMenuInteraction>) => {
                collected.first()?.editReply({
                    content: "⏰ Time's up", components: [
                        new MessageActionRow().addComponents(
                            {
                                type: "BUTTON",
                                style: "LINK",
                                url: "https://tweetcord.xyz",
                                label: "Visit our website!"
                            },
                            {
                                type: "BUTTON",
                                style: "LINK",
                                url: "https://discord.gg/ZWfpZuw4mn",
                                label: "Join support server!"
                            }
                        )
                    ]
                })
            })

        }
    }
}