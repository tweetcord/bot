import { MessageEmbed, Util } from "discord.js"
import { FullUser } from "twitter-d"

export default class Embeds {
     public static nsfw() {
        return {
            "title": "You have to use this command in NSFW marked channels.",
            "url": "https://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content",
            "color": 16711680,
            "timestamp": Date.now(),
            "footer": {
                "text": "If you wonder why, look at Discord Guidelines #6"
            },
            "image": {
                "url": "https://i.imgur.com/W1XfLOe.gif"

            }
        }
    }
    public static user(data: FullUser) {
        return {
            "author": {
                "name": data.screen_name,
                "iconURL": data.profile_image_url_https.replace("_normal", "")
            },
            "title": Util.escapeMarkdown(data.name),
            "thumbnail": {
                "url": data.profile_image_url_https.replace("_normal", "")
            }
        }
    }
}

