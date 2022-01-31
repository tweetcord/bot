import { Client } from "discord.js";
import { getWebhookData, sendWebhookMessage, removeFeed, resolveColor, formatTweets } from "../utils/functions";
import Twit from "twit";
import { blockQuote } from "@discordjs/builders";

export default class TWStream {
   public client: Client;
   private streamClient: Twit;
   private stream: Twit.Stream | undefined;
   public constructor(Tweetcord: Client) {
      this.client = Tweetcord;
      this.streamClient = new Twit({
         consumer_key: "eL6OXdMUqVMBFWexNQsXg0T8Q",
         consumer_secret: "r2K7uhYQjeWOlNU02JoMxcXuC5suOjGIsXMG9xKcMPpLcnIzjL",
         access_token: "1310499494912458755-xLht9pfcRkr1IBDfST5XNHeGjnJnNN",
         access_token_secret: "BzLDhp9LJIvMSGIKT6MzDJup4a8z4FWX2oqr1GQkqwdY3",
      });
   }

   public async start() {
      let feeds = await this.client.prisma.feed.findMany();
      if (feeds.length === 0) return;
      let set = new Set(feeds.map((feed: any) => feed.twitterUserId));
      let arr = Array.from(set) as Array<string>;

      this.stream = this.streamClient.stream("statuses/filter", { follow: arr });
      this.stream
         .on("tweet", async (tweet: Twit.Twitter.Status) => {
            this.streamEvent(tweet);
         })
         .on("error", (error: any) => {
            console.log("Stream error: ", error);
         });
   }
   private async streamEvent(tweetA: any) {
      let tweet: Twit.Twitter.Status = tweetA;
      let that = this;
      let userID = tweet.user.id_str;
      let profileImageURL = tweet.user.profile_image_url_https.replace("_normal", "");
      let feeds = await that.client.prisma.feed.findMany({
         where: {
            twitterUserId: userID,
         },
      });
      if (tweetA.extended_tweet) {
         tweet.text = tweetA.extended_tweet.full_text;
         tweet.entities = tweetA.extended_tweet.entities;
      }
      if (tweetA.retweeted_status) {
         let retweeted = tweetA.retweeted_status;
         tweet.text = `RT @${retweeted.user.screen_name}: ${
            retweeted.extended_tweet ? retweeted.extended_tweet.full_text : retweeted.text
         }`;
         tweet.entities = retweeted.extended_tweet ? retweeted.extended_tweet.entities : retweeted.entities;
      }
      if (tweetA.quoted_status) {
         let quoted = tweetA.quoted_status;
         let text = quoted.extended_tweet ? quoted.extended_tweet.full_text : quoted.text;
         tweet.text += `\n\n${blockQuote("@" + quoted.user.screen_name + ": " + text)}`;
         let entities = quoted.extended_tweet ? quoted.extended_tweet.entities : quoted.entities;
         if (entities) {
            tweet.entities = entities;
         }
      }
      let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
      tweet.text = await formatTweets(tweet.text as string);

      let embeds: Array<any> = [
         {
            url: url,
            description: tweet.text,
            author: {
               name: `${tweet.user.name} (@${tweet.user.screen_name})`,
               icon_url: tweet.user.profile_image_url_https.replace("_normal", ""),
               url: url,
            },
            footer: { text: "Tweetcord Notifications", icon_url: that.client.user?.displayAvatarURL({ size: 2048 }) },
            color: resolveColor("#1da0f6"),
            timestamp: new Date(),
         },
      ];
      console.log(tweetA);

      let i = 0;
      if (tweet.entities.media) {
         for (let img of tweet.entities.media) {
            let imgURL = img.media_url;
            if (embeds[i]) {
               embeds[i].image = { url: imgURL };
            } else {
               embeds[i] = { url: url, image: { url: imgURL } };
            }
            i++;
         }
      }

      let webhookOptions = {
         username: `${tweet.user.name} (@${tweet.user.screen_name})`,
         avatar_url: profileImageURL,
         embeds,
         content: "",
      };

      for (let feed of feeds) {
         if (tweet.in_reply_to_status_id && !feed.replies) continue;
         if (tweet.retweeted_status && !feed.retweets) continue;
         if (tweet.text?.split(" ").some((key: string) => feed.keywords.some((keywords) => key === keywords))) continue;
         webhookOptions.content = feed.message ? feed.message : "";
         let webhook = await getWebhookData(that.client, feed.channel);
         if (!webhook) {
            await removeFeed(that.client, feed.id);
         } else {
            sendWebhookMessage(that.client, webhook, webhookOptions);
         }
      }
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
