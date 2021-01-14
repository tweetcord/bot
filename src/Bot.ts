import * as dotenv from "dotenv"
import Tweetcord from "./components/Client";
dotenv.config()

const client = new Tweetcord({
    prefix: "!t",
    token: process.env.TOKEN,
    sentry: process.env.SENTRY_DNS,
    owner: process.env.OWNER,
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