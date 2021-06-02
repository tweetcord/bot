import { Message } from "discord.js";
import { Args } from "lexure";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";

export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            triggers: ["stats", "s"],
            description: {
                text: "Stats"
            }
        })
    }
    public async execute(message: Message, args: Args): Promise<void | Message> {
        return message.channel.send({
            embed: {
                fields: [
                     {
                        name: "RAM",
                        value: this.bytesToHRS(process.memoryUsage().rss)
                     }
                ]
            }
        })
    }
    private bytesToHRS(bytes: number) {
        if (Math.abs(bytes) < 1024) {
            return bytes + ' B';
        }
        var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        var u = -1;
        do {
            bytes /= 1024;
            ++u;
        } while (Math.abs(bytes) >= 1024 && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }

}