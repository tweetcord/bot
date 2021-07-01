import { join } from "path";
import { SharderEvents, ShardingManager } from "kurasuta";
import { config } from "dotenv"
import { Tweetcord } from "./components/Client";

config()
const sharder = new ShardingManager(join(__dirname, "index"), {
    token: process.env.DISCORD_TOKEN,
    development: true,
    client: Tweetcord
})
sharder.spawn()

sharder.on(SharderEvents.SHARD_READY, (sid) => {
    return console.log(`Shard ${sid} is ready.`)
})
sharder.on(SharderEvents.SHARD_DISCONNECT, (c, id) => {
    return console.log(`Shard ${id} disconnected; Close event: ${c}`);
})
