import { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";

export default abstract class Command {
    public abstract data(): SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    public abstract run(interaction: CommandInteraction, ...args: any): Promise<void | Message> | Message
}