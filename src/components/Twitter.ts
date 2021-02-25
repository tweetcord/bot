import Twitter from "twitter-lite"
import embeds from "./resources/Embeds";
import { twitter } from "../settings.json";

export default class TwitterClient extends Twitter {
    constructor() {
        super(twitter)
    }
    public async getUser(options: Object): Promise<any> {
        const data = await this.get("users/lookup", options)
        if (!data) return "No users with this name";
        return embeds.user(data[0])
    }

}
