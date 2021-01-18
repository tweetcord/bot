import { Client, Message } from "discord.js";
import Command from "../components/Command";
import { inspect, promisify } from "util";
import { exec } from "child_process";

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
        const { stderr, stdout } = await execute(code)

        if (stderr) return message.channel.send(stderr, {
            split: true,
            code: "js"
        })

        return message.channel.send(stdout, {
            split: true,
            code: "bash"
        })
    }
}