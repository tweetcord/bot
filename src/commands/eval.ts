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
            // @ts-ignore
            .setDefaultPermission(false)
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction?.deferReply({
            ephemeral: true
        })
        if (["534099893979971584", "548547460276944906", "300573341591535617", "693445343332794408"].includes(interaction.user.id)) {
            return interaction.followUp({
                content: "No",
                ephemeral: true
            })
        }
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