import { Collection, CommandInteraction, InteractionReplyOptions, Message, MessageActionRow, MessageComponentInteraction } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "tweets"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | void> {
        const data = await this.bot.twitter.v1.get("statuses/user_timeline", {
            screen_name: interaction.options.get("username")?.value,
            exclude_replies: interaction.options.get("show_replies") ? !interaction.options.get("show_replies")?.value : false,
            include_rts: interaction.options.get("show_retweets")?.value
        })
        if (data.length === 0) return interaction.reply({ content: "No tweets found" })
        await interaction?.deferReply()
        const row = new MessageActionRow().addComponents(
            {
                customId: "first",
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "previous",
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "next",
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON"
            },
            {
                customId: "last",
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON"
            })
        const firstRow = new MessageActionRow().addComponents(
            {
                customId: "first",
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true
            },
            {
                customId: "previous",
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true
            },
            {
                customId: "next",
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON"
            },
            {
                customId: "last",
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON"
            })
        const lastRow = new MessageActionRow().addComponents(
            {
                customId: "first",
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "previous",
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "next",
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true
            },
            {
                customId: "last",
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true
            })
        const answers: InteractionReplyOptions[] = []
        const tweets = data.slice(0, data.length > 10 ? 10 : data.length)

        for (let i = 0; i < tweets.length; i++) {
            const url = `https://twitter.com/${tweets[i].user.screen_name}/status/${tweets[i].id_str}`
            answers.push({
                content: `**(${i + 1}/${tweets.length})** ${url}`,
                components: answers.length === 0 ? [firstRow] : (tweets.length === i + 1 ? [lastRow] : [row])
            })
        }
        interaction.editReply({ content: `**(1/${tweets.length})** https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`, components: [firstRow] })
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
                components: [
                    new MessageActionRow().addComponents(
                        {
                            customId: "first",
                            emoji: "860524771832496138",
                            style: "PRIMARY",
                            type: "BUTTON",
                            disabled: true
                        },
                        {
                            customId: "previous",
                            emoji: "860524798181900308",
                            style: "PRIMARY",
                            type: "BUTTON",
                            disabled: true
                        },
                        {
                            customId: "next",
                            emoji: "860524837675073556",
                            style: "PRIMARY",
                            type: "BUTTON",
                            disabled: true
                        },
                        {
                            customId: "last",
                            emoji: "860524885230223370",
                            style: "PRIMARY",
                            type: "BUTTON",
                            disabled: true
                        })
                ]
            })
        })
    }
}