import { Message, Util } from "discord.js";
import { Args, joinTokens } from "lexure";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";
import { FullUser } from "twitter-d"
import { getColorFromURL } from "color-thief-node"
import moment from "moment"
export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            triggers: ["user", "u"],
            description: {
                text: "User information"
            }
        })
    }
    public async execute(message: Message, args: Args): Promise<void | Message> {
        let data = await this.bot.twitter.get("users/lookup", {
            screen_name: args.single()
        })
        const user: FullUser = data[0]
        const color = await getColorFromURL(user.profile_image_url_https.replace("_normal", ""))
        const embed = {
            color,
            title: `${Util.escapeMarkdown(user.name)} ${user.verified ? "<:verified:743873088185172108>" : ""}`,
            author: {
                name: user.screen_name,
                url: "https://twitter.com" + user.screen_name,
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
                iconURL: message.author.displayAvatarURL()
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
                    value: `${moment.utc(Date.parse(user.created_at)).format("LL")} \n (${moment(moment.utc(Date.parse(user.created_at))).fromNow()})`,
                    inline: true
                }
            ]
        }
        if (user.description) Object.assign(embed, {
            description: `>>> ${user.description}`, // blockquote for description
        })
        if (user.location) embed.fields.push({
            name: "Location",
            value: user.location,
            inline: true
        })
        return message.channel.send({ embed })
    }

}