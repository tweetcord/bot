import { CommandInteraction } from "discord.js";

export interface LoggerOptions {
    title: string,
    text: string
}

export interface MenuOptions {
    interaction: CommandInteraction;
}