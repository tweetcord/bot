import { Message, CommandInteraction } from "discord.js";
import Tweetcord from "@components/Client";


interface CommandOptions {
    commandName: string
}

export default abstract class Command {
    public bot: Tweetcord;
    public name: string;

    public constructor(client: Tweetcord, i: CommandOptions) {
        this.bot = client;
        this.name = i.commandName
    }

    public abstract reply(interaction: CommandInteraction, ...args: any): Promise<void | Message> | Message
}