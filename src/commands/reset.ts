import { SlashCommandBuilder } from "@discordjs/builders";
import { removeGuildData, getGuildData, iDefer, iFollowUp } from "../utils/functions";
import { CommandInteraction } from "discord.js";
import { emojis } from "../constants";
import Command from "../components/Command";

export default class Reset extends Command {
    public data() {
        return new SlashCommandBuilder().setName("reset").setDescription("Reset feeds for this guild");
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        let db = await getGuildData(interaction);
        await iDefer(interaction, { ephemeral: true });
        if (interaction.user.id !== interaction.guild?.ownerId) return interaction.followUp({ content: emojis.f + "You are not owner of this guild." });
        if (!db) return interaction.followUp({ content: emojis.f + "This guilds database is already empty." });
        let error = await removeGuildData(interaction.client, interaction.guild.id, db);
        if (error) return interaction.followUp({ content: emojis.f + "Tweetcord has been rate limited on this server please try again later." });
        iFollowUp(interaction, { content: emojis.t + "This guild's database has been reset" });
    }
}
