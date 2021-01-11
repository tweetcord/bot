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
}

