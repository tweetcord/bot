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
            .setDescription("Allows you to search tweet/user on Twitter")
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
        await interaction?.deferReply({ ephemeral: true })
        const subcommand = interaction.options.getSubcommand(true)
        if (subcommand === "tweet") {
            const { data } = await interaction.client.twitter.v2.search(interaction.options.getString("text", true), {
                "max_results": 100
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
                await interaction.followUp({
                    content: "No results found.",
                    ephemeral: true
                })
                return;
            }
            await interaction.followUp({
                content: `**(1/${tweets.length})** https://twitter.com/i/web/status/${tweets.at(0)?.id}`,
                components: [TweetsFirstRow],
                ephemeral: true
            })
            const menu = new ButtonMenu(answers);
            return menu.start({ interaction })
        } else if (subcommand === "user") {
            const { data } = await interaction.client.twitter.v1.searchUsers(interaction.options.getString("username", true))
            const options: MessageSelectOptionData[] = data.slice(0, 25).map((u, i) => {
                return Object.assign({}, {
                    label: u.screen_name,
                    // Description 100den büyükse 99dan kesip 3 nokta unicode'u ekliyor
                    // https://discord.com/developers/docs/interactions/message-components#select-menu-object
                    description: u.description?.length === 0 ? "No description" : (u.description?.length! > 100 ? u.description?.substring(0, 99) + "\u2026" : u.description)!,
                    value: (++i).toString()
                })
            })
            const menu = new SelectMenu(options)
            return menu.start({ interaction, data })
        }
    }
}