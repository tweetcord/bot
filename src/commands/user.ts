import { Message, Util } from "discord.js";
import { Args, joinTokens } from "lexure";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";
import { FullUser } from "twitter-d"
import { getColorFromURL } from "color-thief-node"
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
        return message.channel.send({
            embed: {
                color,
                title: Util.escapeMarkdown(user.name),
                description: `>>> ${user.description}`,
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
                }
            }
        })
    }

}