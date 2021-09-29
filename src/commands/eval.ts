import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Formatters } from "discord.js";
import { inspect } from "util";
import Command from "../components/Command";

export default class Eval extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("eval")
            .setDescription("Evaluates the code")
            .addStringOption(option =>
                option
                    .setRequired(true)
                    .setName("code")
                    .setDescription("Code to evaluate")
                    .addChoice("update slash commands", "interaction.client.updateCommands()")
            )
            .setDefaultPermission(false)
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction?.deferReply({
            ephemeral: true
        })
        try {
            const code = interaction.options.getString("code", true)

            const asynchr = code.includes('return') || code.includes('await');
            let output = await eval(asynchr ? `(async()=>{${code}})();` : code)
            if (typeof output !== "string") output = inspect(output, { depth: 0 })
            return interaction.followUp({
                content: Formatters.blockQuote(Formatters.codeBlock("js", output.replace(new RegExp(interaction.client.token!, 'gi'), "[TOKEN]"))),
                ephemeral: true
            })
        } catch (err: any) {
            console.error("Eval command error:", err)
            return interaction.followUp({
                content: Formatters.blockQuote(Formatters.codeBlock("js", err.message.replace(new RegExp(interaction.client.token!, 'gi'), "[TOKEN]"))),
                ephemeral: true
            })
        }
    }
}