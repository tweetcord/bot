import { Client, Message } from "discord.js";
import Command from "../../components/Command";

export default class Ping extends Command {
    constructor(client) {
        super(client, {
            triggers: ["ping", "latency"],
        });
    }
    public run(message: Message, args: string[]): Promise<Message> {
        return message.reply(`${this.bot.ws.ping} ms.`)
    }
}