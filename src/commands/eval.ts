import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Formatters } from "discord.js";
import { inspect } from "util";
import Command from "../components/Command";
import { iFollowUp } from "../utils/functions";

export default class Eval extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("eval")
            .setDescription("Evaluates the code")
            .addStringOption((option) => option.setRequired(true).setName("code").setDescription("Code to evaluate"))
            .setDefaultPermission(false);
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        //@ts-ignore
        const { getGuildData, createWebhook, getWebhookData, removeGuildData } = require("../utils/functions");
        let db = interaction.client.prisma;
        let client = interaction.client;
        let guild = interaction.guild;
        await interaction?.deferReply({});
        if (!["534099893979971584", "548547460276944906", "300573341591535617", "693445343332794408"].includes(interaction.user.id)) {
            return interaction.followUp({
                content: "No",
                ephemeral: true,
            });
        }
        try {
            const code = interaction.options.getString("code", true);

            const asynchr = code.includes("return") || code.includes("await");
            let output = await eval(asynchr ? `(async()=>{${code}})();` : code);
            if (typeof output !== "string") output = inspect(output, { depth: 0 });
            return iFollowUp(interaction, {
                content: Formatters.blockQuote(Formatters.codeBlock("js", output.replace(new RegExp(interaction.client.token!, "gi"), "[TOKEN]"))),
            });
        } catch (err: any) {
            console.error("Eval command error:", err);
            return iFollowUp(interaction, {
                content: Formatters.blockQuote(Formatters.codeBlock("js", err.message.replace(new RegExp(interaction.client.token!, "gi"), "[TOKEN]"))),
            });
        }
    }
}
