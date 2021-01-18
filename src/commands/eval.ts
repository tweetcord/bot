import { Client, Message } from "discord.js";
import Command from "../components/Command";
import { inspect } from "util";
import util from "../components/Util";
export default class Eval extends Command {
    constructor(client: Client) {
        super(client, {
            triggers: ["eval", "e"],
            ownerOnly: true
        });
    }
    public async run(message: Message, args: string[]): Promise<Message | Message[]> {
        const code = args.join(" ")
        try {
            const isAsync = code.includes('return') || code.includes('await');

            const start = process.hrtime()
            let result: any = await eval(isAsync ? `(async()=>{${code}})();` : code)
            const end = process.hrtime(start)
            const execution = util.convertHrtime(end)


            if (typeof result !== "string") result = inspect(result, { depth: 0 });
            result = `> Execution time: ** ${execution.toFixed(5)} seconds ** \n\`\`\`js\n${result}\`\`\``
            return message.channel.send(result.replace(new RegExp(message.client.token, 'gi'), "[TOKEN]"), {
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