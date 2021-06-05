import { join } from "path";
import { Cluster, SharderEvents, ShardingManager } from "kurasuta";
import { config } from "dotenv"
import { Tweetcord } from "./components/Client";
import chalk from "chalk"

config()
const sharder = new ShardingManager(join(__dirname, "index"), {
    token: process.env.DISCORD_TOKEN,
    development: true,
    client: Tweetcord
})
sharder.spawn()

sharder.on(SharderEvents.SHARD_READY, (sid) => {
 return console.log(chalk.red("[SHARD]"), `Shard ${sid} is ready.`)
})