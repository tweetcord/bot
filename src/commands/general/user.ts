import { Client, Message } from "discord.js";
import Tweetcord from "../../components/Client";
import Command from "../../components/Command";
export default class User extends Command {
    constructor(client: Tweetcord) {
        super(client, {
            triggers: ["user", "u"],
            nsfwOnly: true
        });
    }
    public async run(message: Message, args: string[]): Promise<Message> {
        let embed = await this.bot.twitter.getUser({
            screen_name: args.join()
        })
        return message.reply({ embed })
    }
}