import Twitter from "twitter-lite"
import embeds from "./resources/Embeds";
export class TwitterClient extends Twitter {
    constructor() {
        super({
            consumer_key: 'akDdJn4rNUlmKywGt15bJmscD',
            consumer_secret: 'd7GUatwC2g7wWRtKRhe253NFJjqCN6rRbxHzUqo1gvLNz62B4H',
            access_token_key: '4061434829-brpl5WlaDyol0p2WrzFLghMVtKo3xu5h35MC44T',
            access_token_secret: 'ON1vIv7qrGjg4Yl6nW1b3MaOT10lkE8aOBZ56zukcSYau'
        })
    }
    public async getUser(options: Object): Promise<any> {
        const data = await this.get("users/lookup", options)
        if (!data) return "No users with this name";

        return embeds.user(data)
    }
}