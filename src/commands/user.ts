import { Message, Util } from "discord.js";
import { Args } from "lexure";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";

export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            triggers: ["user", "u"],
            description: {
                text: "User information"
            }
        })
    }
    public async execute(message: Message, args: Args): Promise<void | Message> {
        let { data } = await this.bot.twitter.get("users/lookup", { screen_name: args.single() })
        return message.channel.send({
            embed: {
                title: Util.escapeMarkdown(data[0].name)
            }
        })
    }

}