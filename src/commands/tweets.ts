import { CommandInteraction, MessageActionRow, MessageComponentInteraction, Message } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "tweets"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<void> {
        await interaction.defer()
        const data = await this.bot.twitter.get("statuses/user_timeline", {
            screen_name: interaction.options.get("username")?.value
        })
        if (data.length === 0) return interaction.reply({ content: "No tweets found" })

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
        const answers: any[] = []
        const tweets = data.slice(0, 10)
        for (const tweet of tweets) {
            const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
            answers.push({
                content: `**(${tweets.indexOf(tweet) + 1}/${tweets.length})** ${url}`,
                components: answers.length === 0 ? [firstRow] : (answers.length === 8 ? [lastRow] : [row])
            })
        }

        interaction.editReply({ content: `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`, components: [firstRow] })
        const filter = (i: MessageComponentInteraction) => i.user.id === interaction?.user.id
        const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 30e3 })
        //TODO: Fix number increment
        collector?.on("collect", async (i: MessageComponentInteraction) => {
            await i.deferUpdate();
            let page = 0
            switch (i.customId) {
                case "first":
                    page = 0
                    await i.editReply(answers[0])
                    break;
                case "previous":
                    --page
                    await i.editReply(answers[page])
                    break;
                case "next":
                    ++page
                    await i.editReply(answers[page])
                    break;
                case "last":
                    await i.editReply(answers[9])
                    break;
            }

        })
    }
}