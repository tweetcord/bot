import "dotenv/config";

import Tweetcord from "@components/Client";

const client = new Tweetcord();
client.init();
