import Tweetcord from "./components/Client";
import { config } from "dotenv";
/*
import { BaseCluster } from "kurasuta";
export default class extends BaseCluster {
    declare public client: Tweetcord
    launch() {
        this.client.init()
    }
};
*/

config()
const client = new Tweetcord()
client.init()