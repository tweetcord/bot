import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import Command from "../components/Command";
import { iReply } from "../utils/functions";

export default class Ping extends Command {
    public data() {
        return new SlashCommandBuilder().setName("ping").setDescription("Pong");
    }
    public run(interaction: CommandInteraction): Promise<void> {
        return iReply(interaction, {
            content: `🏓 Pong! ${interaction.client.ws.ping.toString()}`,
        });
    }
}
