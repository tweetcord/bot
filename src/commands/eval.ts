import { CommandInteraction, Formatters, Util } from "discord.js";
import { inspect } from "util";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Eval extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "eval"
        })
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction?.deferReply()
        try {
            const code = interaction.options.get("code")?.value as string
            const asynchr = code.includes('return') || code.includes('await');
            let output = await eval(asynchr ? `(async()=>{${code}})();` : code)
            if (typeof output !== "string") output = inspect(output, { depth: 0 })
            if (output.length >= 2001) {
                let array = Util.splitMessage(output);
                return array.forEach(async a => {
                    await interaction.followUp({ content: Formatters.blockQuote(Formatters.codeBlock("js", a.replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]"))) })
                })
            }
            return interaction.editReply({
                content: Formatters.blockQuote(Formatters.codeBlock("js", output.replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]"))),
            })
        } catch (err: any) {
            console.error("Eval command error:", err)
            return interaction.editReply({
                content: Formatters.blockQuote(Formatters.codeBlock("js", err.message.replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]")))
            })
        }
    }
}