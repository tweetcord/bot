import { CommandInteraction, Formatters, Util } from "discord.js";
import { inspect } from "util";
import Command from "../components/Command";
import { SlashCommandBuilder } from "@discordjs/builders"

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
            )
            .addBooleanOption(option =>
                option
                    .setName("hide_result")
                    .setDescription("Whether or not to hide the result (ephemeral)")
                    .setRequired(false)
            )
            .setDefaultPermission(false)
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction?.deferReply()
        try {
            const code = interaction.options.getString("code", true)
            const asynchr = code.includes('return') || code.includes('await');
            let output = await eval(asynchr ? `(async()=>{${code}})();` : code)
            if (typeof output !== "string") output = inspect(output, { depth: 0 })
            if (output.length >= 2001) {
                let array = Util.splitMessage(output);
                return array.forEach(async a => {
                    await interaction.followUp({ content: Formatters.blockQuote(Formatters.codeBlock("js", a.replace(new RegExp(interaction.client.token!, 'gi'), "[TOKEN]"))) })
                })
            }
            return interaction.editReply({
                content: Formatters.blockQuote(Formatters.codeBlock("js", output.replace(new RegExp(interaction.client.token!, 'gi'), "[TOKEN]"))),
            })
        } catch (err: any) {
            console.error("Eval command error:", err)
            return interaction.editReply({
                content: Formatters.blockQuote(Formatters.codeBlock("js", err.message.replace(new RegExp(interaction.client.token!, 'gi'), "[TOKEN]")))
            })
        }
    }
}