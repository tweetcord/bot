import { Client, Message } from "discord.js";
import Command from "../components/Command";
import { inspect } from "util";
export default class Eval extends Command {
    constructor(client: Client) {
        super(client, {
            triggers: ["eval", "e"],
            ownerOnly: true
        });
    }
    public async run(message: Message, args: string[]): Promise<Message> {
        const code = args.join(" ")
        try {
            const isAsync = args.join(" ").includes('return') || code.includes('await');

            let result = await eval(isAsync ? `(async()=>{ return ${code}})();` : code)
            if (typeof result !== "string") result = inspect(result, { depth: 0 });

            // @ts-ignore
            return message.channel.send(result, {
                code: "js",
                split: true
            })
        } catch (error) {
            message.channel.send(error.message, {
                split: true
            })
        }
    }
}