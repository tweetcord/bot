import { Message, CommandInteraction } from "discord.js";
import { Tweetcord } from "./Client";


interface CommandOptions {
    commandName: string
}
export abstract class Command {
    public bot: Tweetcord;
    public name: string;
    public constructor(client: Tweetcord, i: CommandOptions) {
        this.bot = client;
        this.name = i.commandName
    }
    
    public abstract reply(interaction: CommandInteraction): Promise<void> | Message
}