import Tweetcord from "./components/Client";
import { config } from "dotenv";
config()
const client = new Tweetcord()
client.init()