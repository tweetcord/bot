import { Client, Message } from "discord.js";
import Command from "../../components/Command";

export default class User extends Command {
    constructor(client: Client) {
        super(client, {
            triggers: ["user", "u"],
            nsfwOnly: true
        });
    }
    public run(message: Message, args: string[]): Promise<Message> {
        return message.reply({
            embed: {
                
            }
        })
    }
}