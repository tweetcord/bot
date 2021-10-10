import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import Command from "../components/Command";

export default class Invite extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("invite")
            .setDescription("Invite Tweetcord to your server")
    }
    public run(interaction: CommandInteraction): Promise<void> {
        return interaction.reply({
            content: `https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user?.id}&scope=applications.commands+bot&permissions=537259072`
        });
    }
}