import { Client, Message } from "discord.js";
import Command from "../components/Command";
import { inspect, promisify } from "util";
import { exec } from "child_process";
import util from "../components/Util";
const execute = promisify(exec)
export default class Eval extends Command {
    constructor(client: Client) {
        super(client, {
            triggers: ["exec", "ex"],
            ownerOnly: true
        });
    }
    public async run(message: Message, args: string[]): Promise<Message | Message[]> {
        const code = args.join(" ")
        try {
            const start = process.hrtime()
            const { stderr, stdout } = await execute(code)
            const end = process.hrtime(start)
            const execution = util.convertHrtime(end)
            if (stderr) return message.channel.send(stderr, {
                split: true,
                code: "js"
            })

            return message.channel.send(`> Execution time: **${execution.toFixed(5)} seconds** \n\`\`\`bash\n$ ${code}\n\n${stdout}\`\`\``, {
                split: true,
            })
        } catch (err) {
            return message.channel.send(err, {
                split: true,
                code: "js"
            })
        }

    }
}