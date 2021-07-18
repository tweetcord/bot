import Tweetcord from "./components/Client";
/*
import { BaseCluster } from "kurasuta";
export default class extends BaseCluster {
    declare public client: Tweetcord
    launch() {
        this.client.init()
    }
};
*/
import { config } from "dotenv";

config()
const client = new Tweetcord()
client.init()