import { CommandInteraction, Formatters, Message, MessageEmbedOptions, Util } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class User extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "user"
        })
    }
    public async run(interaction: CommandInteraction): Promise<Message | void> {
        await interaction?.deferReply()
        let { data: user } = await this.bot.twitter.v2.userByUsername(interaction.options.getString("username", true), {
            "user.fields": ["created_at", "description", "location", "profile_image_url", "protected", "public_metrics", "url", "verified"]
        })
        const embed: MessageEmbedOptions = {
            title: `${Util.escapeMarkdown(user.name)} ${user.verified ? Formatters.formatEmoji("743873088185172108") : ""}`,
            author: {
                name: Util.escapeMarkdown(user.username),
                url: `https://twitter.com/i/user/${user.id}`,
                iconURL: user.profile_image_url?.replace("_normal", "")
            },
            thumbnail: {
                url: user.profile_image_url?.replace("_normal", "")
            },
            footer: {
                text: `Twitter ID is ${user.id}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: Date.now(),
            fields: [
                {
                    name: "Followers",
                    value: user.public_metrics?.followers_count?.toLocaleString() ?? "Unknown",
                    inline: true
                },
                {
                    name: "Following",
                    value: user.public_metrics?.following_count?.toLocaleString() ?? "Unknown",
                    inline: true
                },
                {
                    name: "Tweets",
                    value: user.public_metrics?.tweet_count?.toLocaleString() ?? "Unknown",
                    inline: true
                },
                {
                    name: "Lists",
                    value: user.public_metrics?.listed_count?.toLocaleString() ?? "Unknown",
                    inline: true
                },
                {
                    name: "Protected",
                    value: user.protected ? "Yes" : "No",
                    inline: true
                },
                {
                    name: "Verified",
                    value: user.verified ? "Yes" : "No",
                    inline: true
                },
                {
                    name: "Account creation date",
                    value: Formatters.time(Date.parse(user.created_at as string) / 1000, "R"),
                    inline: true
                },
                {
                    name: "Location",
                    value: user.location ?? "Unknown",
                    inline: true
                }
            ]
        }
        if (user.description) Object.assign(embed, {
            description: `>>> ${user.description}`,
        })
        interaction.editReply({ embeds: [embed] });
    }
}