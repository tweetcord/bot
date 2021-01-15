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
    public async run(message: Message, args: string[]): Promise<Message | Message[]> {
        const code = args.join(" ")
        console.log(code)
        
        try {
            const isAsync = code.includes('return') || code.includes('await');

            let result: any = eval(isAsync ? `(async()=>{${code}})();` : code)
            if (typeof result !== "string") result = inspect(result, { depth: 0 });
            console.log(typeof result, code);

            return message.channel.send(result.replace(new RegExp(message.client.token, 'gi'), "[TOKEN]"), {
                code: "js",
                split: true
            })
        } catch (error) {
            console.log("error");
            return message.channel.send(error.message, {
                split: true
            })

        }
    }
}