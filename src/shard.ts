import { join } from "path";
import { SharderEvents, ShardingManager } from "kurasuta";
import { config } from "dotenv"
import { Tweetcord } from "./components/Client";
import { baseLogger } from "./util/logger";

config()
const sharder = new ShardingManager(join(__dirname, "index"), {
    token: process.env.DISCORD_TOKEN,
    development: true,
    client: Tweetcord
})
sharder.spawn()

sharder.on(SharderEvents.SHARD_READY, (sid) => {
 return baseLogger.info(`Shard ${sid} is ready.`)
})
