import { CommandInteraction, Formatters } from "discord.js";
import { inspect } from "util";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Eval extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "eval"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<any> {
        await interaction.defer()
        if (!["548547460276944906", "534099893979971584"].includes(interaction.user.id)) return interaction.reply({content: "You can't use this."})
        try {
            const code = interaction.options.get("code")?.value as string
            const asynchr = code.includes('return') || code.includes('await');
            let output = await eval(asynchr ? `(async()=>{${code}})();` : code)
            if (typeof output !== "string") output = inspect(output, { depth: 0 })
            return interaction.editReply({
                content: Formatters.codeBlock("js", output.replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]"))
            });

        } catch (err) {
            return interaction.editReply({
                content: err.message.replace(new RegExp(this.bot.token!, 'gi'), "[TOKEN]")
            })
        }
    }
}