import "dotenv/config";
import "tsconfig-paths/register"
import Tweetcord from "./components/Client";

const client = new Tweetcord();
client.init();
