import Tweetcord from "./components/Client";
import { config } from "dotenv"

require("./api/index")
config({
    debug: true
})

const client = new Tweetcord({
    cacheEmojis: false,
    cacheOverwrites: true,
    cacheChannels: false,
    cacheRoles: false,
    cachePresences: false,
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