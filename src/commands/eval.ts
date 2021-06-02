import { Message } from "discord.js";
import { Args, joinTokens } from "lexure";
import { inspect } from "util";
import { Tweetcord } from "../components/Client";
import { Command } from "../components/Command";

export default class Eval extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            triggers: ["eval", "e"],
            ownerOnly: true,
            description: {
                text: "Code execution"
            }
        })
    }
    public async execute(message: Message, args: Args): Promise<void | Message> {
        try {
            const code = joinTokens(args.many())
            const asynchr = code.includes('return') || code.includes('await');
            let output = await eval(asynchr ? `(async()=>{${code}})();` : code)
            if (typeof output !== "string") output = inspect(output, { depth: 0 })
            message.channel.send(output
                .replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]"),
                { code: "js", split: true });

        } catch (err) {
            message.channel.send(err.message
                .replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]"),
                { code: "js", split: true });
        }
    }

}