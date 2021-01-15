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
        const asynchr = args.join(" ").includes('return') || code.includes('await');
        let result = await eval(asynchr ? `(async()=>{ return ${code}})();` : code)
        if (typeof result !== "string") result = inspect(result, { depth: 0 });

    
        message.channel.send(result, {
            code: "js",
            split: true
        })

          
        return message.reply(`${this.bot.ws.ping} ms.`)
    }
}