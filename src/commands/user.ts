import { CommandInteraction, Formatters, MessageEmbedOptions, Util } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class User extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "user"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<void> {
        await interaction?.deferReply()
        let { data: user } = await this.bot.twitter.v2.userByUsername(interaction.options.getString("username", true))
        const embed: MessageEmbedOptions = {
            title: `${Util.escapeMarkdown(user.name)} ${user.verified ? "<:verified:743873088185172108>" : ""}`,
            author: {
                name: user.username,
                url: `https://twitter.com/${user.username}`,
                iconURL: user.profile_image_url?.replace("_normal", "")
            },
            thumbnail: {
                url: user.profile_image_url?.replace("_normal", "")
            },
            footer: {
                text: `Twitter ID is ${user.id}`,
                iconURL: interaction.user.displayAvatarURL()
            },
            fields: [
                {
                    name: "Followers",
                    value: user.public_metrics?.followers_count?.toLocaleString()!,
                    inline: true
                },
                {
                    name: "Following",
                    value: user.public_metrics?.following_count?.toLocaleString()!,
                    inline: true
                },
                {
                    name: "Tweets",
                    value: user.public_metrics?.tweet_count?.toLocaleString()!,
                    inline: true
                },
                {
                    name: "Lists",
                    value: user.public_metrics?.listed_count?.toLocaleString()!,
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
                }
            ]
        }
        if (user.description) Object.assign(embed, {
            description: `>>> ${user.description}`,
        })
        if (user.location) embed.fields?.push({
            name: "Location",
            value: user.location,
            inline: true
        })
        interaction.editReply({ embeds: [embed] });
    }
}