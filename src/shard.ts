import { join } from "path";
import { ShardingManager } from "kurasuta";
import { config } from "dotenv"
import { Tweetcord } from "./components/Client";

config()
const sharder = new ShardingManager(join(__dirname, "index"), {
    token: process.env.DISCORD_TOKEN,
    development: true,
    shardCount: "auto",
    client: Tweetcord
})

sharder.spawn()