import Tweetcord from "./components/Client";
require("./api/index")

const client = new Tweetcord({
    cacheEmojis: false,
    cacheOverwrites: true,
    cacheChannels: false,
    cacheRoles: false,
    cachePresences: false,
    presence: {
        activity: {
            name: 'tweets',
            type: 'LISTENING'
        }
    },
    ws: {
        intents: 1585
    },
    restRequestTimeout: 60e3,
    messageCacheMaxSize: 1,
    messageCacheLifetime: 10,
    messageSweepInterval: 15,
    messageEditHistoryMaxSize: 0,
})

client.init()