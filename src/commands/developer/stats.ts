import { Client, Message } from "discord.js";
import Command from "../../components/Command";
import util from "../../components/Util";
export default class Stats extends Command {
    constructor(client: Client) {
        super(client, {
            triggers: ["stats", "botinfo"],
        });
    }
    public run(message: Message, args: string[]): Promise<Message> {
        return message.channel.send({
            embed: {
                author: {
                    icon_url: this.bot.user.avatarURL({ dynamic: true }),
                    name: this.bot.user.username
                },
                fields: [
                    {
                        name: "Guilds",
                        value: this.bot.guilds.cache.size,
                        inline: true
                    },
                    {
                        name: "Followed Twitter user",
                        value: "31",
                        inline: true
                    },
                    {
                        name: "RAM usage",
                        value: util.convertBytes(process.memoryUsage().rss),
                        inline: true
                    },
                ]
            }
        })
    }
}