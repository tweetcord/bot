import { CommandInteraction, MessageActionRow, Message, Interaction } from "discord.js";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "tweets"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<void> {
        const data = await this.bot.twitter.get("statuses/user_timeline", {
            screen_name: interaction.options.get("username")?.value
        })
        if (data.length === 0) return interaction.reply({ content: "No tweets found" })

        const row = new MessageActionRow().addComponents(
            {
                customID: "first",
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customID: "previous",
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customID: "next",
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON"
            },
            {
                customID: "last",
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON"
            })
        const answers = []
        const tweets = data.slice(0, 10)
        for (const tweet of tweets) {
            const url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
            answers.push({
                content: `(${tweets.indexOf(tweet) + 1}/${tweets.length})** ${url}`
            })
        }

        interaction.reply({ content: `https://twitter.com/${data[0].user.screen_name}/status/${data[0].id_str}`, components: [row] })

        const message = await interaction.fetchReply()
        const filter = (i: Interaction) => i.user.id === message.author.id;

    }
}