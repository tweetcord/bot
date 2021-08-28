import { Collection, CommandInteraction, InteractionReplyOptions, Message, MessageComponentInteraction } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";
import { TweetsCollectorEndButtons, TweetsFirstRow, TweetsLastRow, TweetsRow } from "../constants";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "tweets"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | void> {
        let { data: user } = await this.bot.twitter.v2.userByUsername(interaction.options.getString("username", true))
        const data = await this.bot.twitter.v2.userTimeline(user.id)
        if (data?.tweets?.length === 0) return interaction.reply({ content: "No tweets found" })
        await interaction?.deferReply()
        const answers: InteractionReplyOptions[] = []
        const tweets = data?.tweets.slice(0, data?.tweets.length > 10 ? 10 : data.tweets.length)

        for (let i = 0; i < tweets?.length; i++) {
            const url = `https://twitter.com/i/web/status/${tweets.at(i)?.id}`
            answers?.push({
                content: `**(${i + 1}/${tweets.length})** ${url}`,
                components: answers.length === 0 ? [TweetsFirstRow] : (tweets.length === i + 1 ? [TweetsLastRow] : [TweetsRow])
            })
        }
        interaction.editReply({ content: `**(1/${tweets.length})** https://twitter.com/i/web/status/${tweets.at(0)?.id}`, components: [TweetsFirstRow] })
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction?.user.id
        const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60e3 })
        let page: number = 0
        collector?.on("collect", async (i: MessageComponentInteraction) => {
            await i.deferUpdate();
            switch (i.customId) {
                case "first":
                    page = 0
                    await i.editReply(answers[0])
                    break;
                case "previous":
                    page--
                    await i.editReply(answers[page])
                    break;
                case "next":
                    page++
                    await i.editReply(answers[page])
                    break;
                case "last":
                    page = answers.length
                    await i.editReply(answers[page])
                    break;
            }
        })
        collector?.on("end", (collected: Collection<string, MessageComponentInteraction>) => {
            collected.first()?.editReply({
                components: [TweetsCollectorEndButtons]
            })
        })
    }
}