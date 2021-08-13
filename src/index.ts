import "dotenv/config";

import Tweetcord from "@components/Client";

/*
import { BaseCluster } from "kurasuta";

export default class extends BaseCluster {
  public declare client: Tweetcord;
  launch() {
    this.client.init();
  }
}
*/

const client = new Tweetcord();
client.init();
