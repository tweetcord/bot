import { Message } from "discord.js";
import { Args } from "lexure";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";

export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            triggers: ["ping", "latency"],
            description: {
                text: "Bot's latency"
            }
        })
    }
    public async execute(message: Message, args: Args): Promise<void | Message> {
        const sent = await message.channel.send("Calculating...");
        const heartbeat = Math.round(this.bot.ws.ping);
        const latency = sent.createdTimestamp - message.createdTimestamp;
        return sent.edit(`Pong! API latency is ${latency}, Heartbeat is ${heartbeat}`);
    }
    
}