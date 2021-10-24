import { Client, MessageEmbedOptions } from "discord.js";
import { blockQuote } from "@discordjs/builders";
import { getWebhookData, sendWebhookMessage, formatTweets, removeFeedById } from "../utils/functions";
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
        this.start();
    }

    public async start() {
        let feeds = await this.client.prisma.feed.findMany();
        if (feeds.length === 0) return;
        let set = new Set(feeds.map((feed: any) => feed.twitterUserId));
        let arr = Array.from(set);
        let that = this;

        this.stream = this.streamClient.stream("statuses/filter", { follow: arr as Array<string> });
        this.stream.on("tweet", async function (tweet) {
            let imgs = tweet.extended_entities?.media;
            let userID = tweet.user.id_str;
            let screen_name = tweet.user.screen_name;
            let profileImageURL = tweet.user.profile_image_url_https.replace("_normal", "");
            let feeds = await that.client.prisma.feed.findMany({
                where: {
                    twitterUserId: userID,
                },
            });
            let content = await formatTweets(tweet.text);

            if (tweet.is_quote_status) {
                let quote = tweet.quoted_status;
                content += "\n\n" + blockQuote(`**${quote.user.screen_name} (@${quote.user.name})**`) + "\n" + quote.text;
                await formatTweets(tweet.text);
            }

            let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
            let embeds: Array<MessageEmbedOptions> = [
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
                },
            ];
            if (imgs) {
                let i = 0;
                for (let img of imgs) {
                    let urlIMG = img.media_url_https;
                    i++;
                    if (embeds[i]) {
                        embeds[i].image = { url: urlIMG };
                    } else {
                        embeds[i] = { url: url, image: { url: urlIMG } };
                    }
                }
            }
            let webhookOptions = {
                username: `${screen_name} (@${tweet.user.name})`,
                avatar_url: profileImageURL,
                embeds: embeds,
                content: "",
            };

            for (let feed of feeds) {
                webhookOptions.content = feed.message ? feed.message : "";
                let webhook = await getWebhookData(that.client, feed.channel);
                if (!webhook) {
                    await removeFeedById(that.client, feed.twitterUserId, feed.guildId as string, feed.channel);
                } else {
                    sendWebhookMessage(that.client, webhookOptions, webhook.webhookId, webhook.webhookToken, feed);
                }
            }
        });
    }

    public async restart() {
        this.stream.stop();
        this.start();
    }
}
