import { CommandInteraction, Formatters, Util } from "discord.js";
import { FullUser } from "twitter-d";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class User extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "user"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<void> {
        await interaction?.defer()
        let data = await this.bot.twitter.get("users/lookup", {
            screen_name: interaction.options.get("username")?.value
        })
        const user: FullUser = data[0];
        const embed = {
            title: `${Util.escapeMarkdown(user.name)} ${user.verified ? "<:verified:743873088185172108>" : ""}`,
            author: {
                name: user.screen_name,
                url: `https://twitter.com/${user.screen_name}`,
                iconURL: user.profile_image_url_https.replace("_normal", "")
            },
            thumbnail: {
                url: user.profile_image_url_https?.replace("_normal", "")
            },
            image: {
                url: user.profile_banner_url?.replace("_normal", "")
            },
            footer: {
                text: `Twitter ID is ${user.id}`,
                iconURL: interaction.user.displayAvatarURL()
            },
            fields: [
                {
                    name: "Followers",
                    value: user.followers_count.toLocaleString(),
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
                    name: "Favourites",
                    value: user.favourites_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Lists",
                    value: user.listed_count.toLocaleString(),
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
                    value: Formatters.time(Date.parse(user.created_at) / 1000, "R"),
                    inline: true
                }
            ]
        }
        if (user.description) Object.assign(embed, {
            description: `>>> ${user.description}`,
        })
        if (user.location) embed.fields.push({
            name: "Location",
            value: user.location,
            inline: true
        })
        interaction.editReply({ embeds: [embed] });
    }
}