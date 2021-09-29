import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Permissions } from "discord.js";
import Command from "../components/Command";

export default class Ping extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("feed")
            .setDescription("Create, delete and edit feeds")
            .addSubcommand(command =>
                command
                    .setName("add")
                    .setDescription("Adds a feed")
                    .addStringOption(option =>
                        option
                            .setName("username")
                            .setDescription("Username to add")
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName("channel")
                            .setDescription("Channel to add")
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName("message")
                            .setDescription("A message that will be sent by bot when there is new tweet")
                    )
            )
            .addSubcommand(command =>
                command
                    .setName("remove")
                    .setDescription("Removes a feed")
                    .addStringOption(option =>
                        option
                            .setName("username")
                            .setDescription("Username to remove")
                            .setRequired(true)
                    )
            )
            .addSubcommand(command =>
                command
                    .setName("list")
                    .setDescription("Lists feeds")
            )
    }
    public run(interaction: CommandInteraction): any {
        if ((interaction.member?.permissions as Permissions).has(Permissions.FLAGS.MANAGE_GUILD)) {
            const subcommand = interaction.options.getSubcommand(true)
            if (subcommand === "add") {
                // Add feed
            } else if (subcommand === "remove") {
                // Remove feed
            } else if (subcommand === "list") {
                // List feeds
            }
        } else {
            return interaction.reply({
                content: "You don't have required permission",
                ephemeral: true
            })
        }
    }
}