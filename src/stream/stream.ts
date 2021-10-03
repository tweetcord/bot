import { Client } from "discord.js"
import Axios from "axios"
import { getWebhookData, formatString } from "../utils/functions"
import { hyperlink } from "@discordjs/builders"
import Twit from "twit"
export default class TWStream {
    public client: Client;
    private streamClient: Twit;
    public constructor(Tweetcord: Client){
        this.client = Tweetcord;
        this.streamClient = new Twit({
            consumer_key: "9h8cxlDBXHIvFEqgAvKd3KUoC",
            consumer_secret: "RuNX1E4r4IRDd0k949yabNj0pR8pzjaPM2RtAxi5OfSAkY5vmA",
            access_token: "1310499494912458755-lWMfCOShmSuDZY46fEvEk0NV4lJRE1",
            access_token_secret: "2SuTuVlOndLVlGOvjdLnoP380q31Njfi2ArZ0DRIJyNrA"
        });
        this.start()
    }

    public async start(){
        let feeds = await this.client.prisma.feed.findMany()
        let set = new Set(feeds.map(feed => feed.twitterUserId))
        let arr = Array.from(set)
        let that = this


        const stream = this.streamClient.stream('statuses/filter', { follow: arr })

        stream.on('tweet', async function (tweet) {
            if(tweet.retweeted_status) return; 
            console.log(tweet);
            let userID = tweet.user.id_str
            let screen_name = tweet.user.screen_name
            let profileImageURL = tweet.user.profile_image_url_https.replace("_normal", "")
            let feeds = await that.client.prisma.feed.findMany({
                where: {
                    twitterUserId: userID,
                }
            })
            let webhookOptions = {
                username: `${screen_name} (@${tweet.user.name})`,
                avatar_url: profileImageURL,
                content: "",
            }
            feeds.forEach(async (feed) => {
                webhookOptions.content = formatString(feed.message, {link: hyperlink('_ _', `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`)})
                let webhook = await getWebhookData(that.client, feed.channel)
                Axios.post(`https://discord.com/api/webhooks/${webhook.webhookId}/${webhook.webhookToken}`,
                            webhookOptions, 
                            {headers: {'Content-Type': 'application/json'}})
            })
        

        })

        
    }
}