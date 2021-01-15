import Tweetcord from "./components/Client";
import * as config from "./Config"
const client = new Tweetcord({
    prefix: "!t",
    token: config.token,
    sentry: config.sentry,
    owner: "534099893979971584",
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