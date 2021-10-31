import { Client } from "discord.js";
import { blockQuote } from "@discordjs/builders";
import { getWebhookData, sendWebhookMessage, formatTweets, removeFeed, resolveColor } from "../utils/functions";
import Twit from "twit";

export default class TWStream {
    public client: Client;
    private streamClient: Twit;
    private stream!: Twit.Stream;
    public constructor(Tweetcord: Client) {
        this.client = Tweetcord;
        this.streamClient = new Twit({
            consumer_key: "9h8cxlDBXHIvFEqgAvKd3KUoC",
            consumer_secret: "RuNX1E4r4IRDd0k949yabNj0pR8pzjaPM2RtAxi5OfSAkY5vmA",
            access_token: "1310499494912458755-lWMfCOShmSuDZY46fEvEk0NV4lJRE1",
            access_token_secret: "2SuTuVlOndLVlGOvjdLnoP380q31Njfi2ArZ0DRIJyNrA",
        });
    }

    public async start() {
        let feeds = await this.client.prisma.feed.findMany();
        if (feeds.length === 0) return;
        let set = new Set(feeds.map((feed: any) => feed.twitterUserId));
        let arr = Array.from(set);
        let that = this;

        this.stream = this.streamClient.stream("statuses/filter", { follow: arr as Array<string> });
        this.stream.on("tweet", async function (tweet) {
            let imgs = tweet.entities?.media?.length === tweet.extended_entities?.media?.length ? tweet.entities?.media : tweet.extended_entities?.media;
            let content = await formatTweets(tweet.text);

            if (tweet.extended_tweet) {
                let ext = tweet.extended_tweet;
                imgs = ext?.entities?.media?.length === ext?.extended_entities?.media?.length ? ext?.entities?.media : ext?.extended_entities?.media;
                content = await formatTweets(ext.full_text);
            }
            let userID = tweet.user.id_str;
            let screen_name = tweet.user.screen_name;
            let profileImageURL = tweet.user.profile_image_url_https.replace("_normal", "");
            let feeds = await that.client.prisma.feed.findMany({
                where: {
                    twitterUserId: userID,
                },
            });

            if (tweet.is_quote_status) {
                let quote = tweet.quoted_status;
                if (quote) {
                    content += "\n\n" + blockQuote(`**${quote.user.screen_name} (@${quote.user.name})**`) + "\n" + quote.text;
                    await formatTweets(tweet.text);
                }
            }

            let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
            let embeds: Array<any> = [
                {
                    url: url,
                    description: content,
                    author: {
                        name: `${screen_name} (@${tweet.user.name})`,
                        icon_url: tweet.user.profile_image_url_https.replace("_normal", ""),
                        url: url,
                    },
                    footer: { text: "Tweetcord Notifications", icon_url: that.client.user?.displayAvatarURL({ size: 2048 }) },
                    timestamp: new Date(),
                    color: resolveColor("#1da0f6"),
                },
            ];
            if (imgs) {
                let i = 0;
                for (let img of imgs) {
                    let urlIMG = img.media_url;
                    if (embeds[i]) {
                        embeds[i].image = { url: urlIMG };
                    } else {
                        embeds[i] = { url: url, image: { url: urlIMG } };
                    }
                    i++;
                }
            }
            let webhookOptions = {
                username: `${screen_name} (@${tweet.user.name})`,
                avatar_url: profileImageURL,
                embeds: embeds,
                content: "",
            };

            for (let feed of feeds) {
                if (tweet.in_reply_to_status_id && !feed.replies) continue;
                if (tweet.retweeted_status && !feed.retweets) continue;
                webhookOptions.content = feed.message ? feed.message : "";
                let webhook = await getWebhookData(that.client, feed.channel);
                if (!webhook) {
                    await removeFeed(that.client, feed.id);
                } else {
                    sendWebhookMessage(that.client, webhook, webhookOptions);
                }
            }
        });
    }

    public async restart() {
        if (this.stream) {
            this.stream.stop();
            this.start();
        } else {
            this.start();
        }
    }
}
