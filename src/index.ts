import "dotenv/config";
import Tweetcord from "./components/Client";
//import Api from "./components/Api";

(async () => {
  const client = new Tweetcord();
  await client.init();
  /*const api = new Api(client);
  api.listen();*/
})();
