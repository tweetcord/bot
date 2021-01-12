import Tweetcord from "./components/Client";
import * as dotenv from "dotenv"

dotenv.config()

const client = new Tweetcord({
    prefix: "!t",
    token: process.env.TOKEN,
    owner: "",
}, {
    presence: {
        activity: {
            name: 'new things',
            type: 'WATCHING'
        }
    },
    ws: {
        intents: 1585
    },
    restRequestTimeout: 60e3,
    messageCacheMaxSize: 10,
    messageCacheLifetime: 60,
    messageSweepInterval: 120,
    messageEditHistoryMaxSize: 0,
})

client.init()