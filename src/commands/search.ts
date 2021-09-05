import { CommandInteraction, InteractionReplyOptions, Message } from "discord.js";
import ButtonMenu from "../components/ButtonMenu";
import Tweetcord from "../components/Client";
import Command from "../components/Command";
import { TweetsFirstRow, TweetsLastRow, TweetsRow } from "../constants";

export default class Search extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "search"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | void> {
        await interaction?.deferReply()
        if (interaction.options.getSubcommand(true) === "tweet") {
            const { data } = await this.bot.twitter.v2.search(interaction.options.getString("text", true), {
                "user.fields": ["username"],
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
            interaction.editReply({ content: `**(1/${tweets.length})** https://twitter.com/i/web/status/${tweets.at(0)?.id}`, components: [TweetsFirstRow] })
            const menu = new ButtonMenu(answers);
            menu.start({ interaction })
        }
    }
}