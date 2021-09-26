import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, InteractionReplyOptions, Message, MessageSelectOptionData } from "discord.js";
import ButtonMenu from "../components/ButtonMenu";
import Command from "../components/Command";
import SelectMenu from "../components/SelectMenu";
import { TweetsFirstRow, TweetsLastRow, TweetsRow } from "../constants";

export default class Search extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("search")
            .addSubcommand(slash =>
                slash
                    .setName("tweet")
                    .setDescription("Tweet search")
                    .addStringOption(option =>
                        option
                            .setName("text")
                            .setDescription("Text to search that tweets contain")
                            .setRequired(true)
                    )
            )
            .addSubcommand(slash =>
                slash
                    .setName("user")
                    .setDescription("User search")
                    .addStringOption(option =>
                        option
                            .setName("username")
                            .setDescription("Username to search")
                            .setRequired(true)
                    )
            )
    }
    public async run(interaction: CommandInteraction): Promise<Message | void> {
        await interaction?.deferReply()
        const subcommand = interaction.options.getSubcommand(true)
        if (subcommand === "tweet") {
            const { data } = await interaction.client.twitter.v2.search(interaction.options.getString("text", true), {
                "max_results": 100,
            })
            const answers: InteractionReplyOptions[] = []
            const tweets = data.data
            for (let i = 0; i < tweets?.length; i++) {
                const url = `https://twitter.com/i/web/status/${tweets.at(i)?.id}`
                answers?.push({
                    content: `**(${i + 1}/${tweets?.length})** ${url}`,
                    components: answers.length === 0 ? [TweetsFirstRow] : (tweets?.length === i + 1 ? [TweetsLastRow] : [TweetsRow])
                })
            }
            if (!tweets) {
                await interaction.editReply("Can't find any tweets")
                return;
            }
            await interaction.editReply({ content: `**(1/${tweets.length})** https://twitter.com/i/web/status/${tweets.at(0)?.id}`, components: [TweetsFirstRow] })
            const menu = new ButtonMenu(answers);
            return menu.start({ interaction })
        } else if (subcommand === "user") {
            const { data } = await interaction.client.twitter.v1.searchUsers(interaction.options.getString("username", true))
            const options: MessageSelectOptionData[] = data.slice(0, 25).map((u, i) => {
                return Object.assign({}, {
                    label: u.screen_name,
                    description: u.description?.length === 0 ? "No description" : (u.description?.length! > 50 ? u.description?.substring(0, 49) + "\u2026" : u.description)!,
                    value: (++i).toString()
                })
            })
            const menu = new SelectMenu(options)
            return menu.start({ interaction, data })
        }
    }
}