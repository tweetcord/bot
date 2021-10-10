import { Client, MessageEmbedOptions } from "discord.js"
import Axios from "axios"
import { getWebhookData, deleteWebhook } from "../utils/functions"
import Twit from "twit"

export default class TWStream {
    public client: Client;
    private streamClient: Twit;
    private stream!: Twit.Stream;
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
        if(feeds.length === 0) return;
        let set = new Set(feeds.map(feed => feed.twitterUserId))
        let arr = Array.from(set)
        let that = this

        this.stream = this.streamClient.stream('statuses/filter', { follow: arr })
        
        this.stream.on('tweet', async function (tweet) {
            if(tweet.retweeted_status) return; 
            let userID = tweet.user.id_str
            let screen_name = tweet.user.screen_name
            let profileImageURL = tweet.user.profile_image_url_https.replace("_normal", "")
            let feeds = await that.client.prisma.feed.findMany({
                where: {
                    twitterUserId: userID,
                }
            })
            let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`
            console.log(tweet.user.profile_image_url_https.replace("_normal", ""));
            let embeds: Array<MessageEmbedOptions> = [
                {
                    url: url,
                    description: tweet.text,
                    author: {name: `${screen_name} (@${tweet.user.name})`, icon_url: tweet.user.profile_image_url_https.replace("_normal", ""), url:url},
                    footer: {text: "Tweetcord Notifications", icon_url: that.client.user?.displayAvatarURL({size: 2048})},
                    timestamp: new Date()
                }
            ]
            
            let webhookOptions = {
                username: `${screen_name} (@${tweet.user.name})`,
                avatar_url: profileImageURL,
                embeds: embeds,
            }
            feeds.forEach(async (feed) => {
                //webhookOptions.content = formatString(feed.message, {link: hyperlink('_ _', url)})
                let webhook = await getWebhookData(that.client, feed.channel)
                Axios.post(`https://discord.com/api/webhooks/${webhook.webhookId}/${webhook.webhookToken}`,
                            webhookOptions, 
                            {headers: {'Content-Type': 'application/json'}}).catch(async e => {
                                if(e.response.data.message === 'Unknown Webhook'){
                                    await deleteWebhook(that.client, feed.channel, feed.guildId as string)
                                }
                                console.log(e.response.data);
                            })
            })
        })
    }

    public async restart(){
        this.stream.stop();
        this.start()
    }
}