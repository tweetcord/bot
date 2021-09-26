import { CommandInteraction, Formatters, Message, MessageActionRow, MessageEmbedOptions, Util } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class User extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "user"
        })
    }

    public async run(interaction: CommandInteraction, screen_name: string): Promise<Message | void> {
        !interaction.deferred && await interaction?.deferReply()
        let user = await this.bot.twitter.v1.user({ screen_name: screen_name ?? interaction.options.getString("username", true) })
        const embed: MessageEmbedOptions = {
            title: `${Util.escapeMarkdown(user.name)} ${user.verified ? Formatters.formatEmoji("743873088185172108") : ""}`,
            author: {
                name: user.screen_name,
                url: `https://twitter.com/i/user/${user.id}`,
                iconURL: user.profile_image_url_https?.replace("_normal", "")
            },
            description: Formatters.blockQuote(user.description || "No description"),
            thumbnail: {
                url: user.profile_image_url_https?.replace("_normal", "")
            },
            image: {
                url: user.profile_banner_url?.replace("_normal", "")
            },
            footer: {
                text: `Twitter ID is ${user.id}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: Date.now(),
            fields: [
                {
                    name: "Followers",
                    value: user.followers_count?.toLocaleString(),
                    inline: true
                },
                {
                    name: "Following",
                    value: user.friends_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Tweets",
                    value: user.statuses_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Lists",
                    value: user.listed_count?.toLocaleString(),
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
                    value: user.location || "Unknown",
                    inline: true
                }
            ]
        }
        const buttons = new MessageActionRow().addComponents({
            label: "View profile",
            type: "BUTTON",
            style: "LINK",
            url: `https://twitter.com/i/user/${user.id}`
        })
        await interaction.followUp({ embeds: [embed], components: [buttons] });
    }
}