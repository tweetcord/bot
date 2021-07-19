import { CommandInteraction } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Trend extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "trend"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<void> {
        // TODO: Add button support and woeid api
        interaction.defer()
        const data = await this.bot.twitter.get("trends/place", {
            id: interaction.options.get("country")?.value?.toString()
        })
        const trend = data[0];
        const embed = {
            title: `Trends in ${trend.locations[0].name}`,
            description: trend.trends.slice(0, 10).map((t: { name: string; url: URL; }) => `[${t.name}](${t.url})`).join("\n"),
            timestamp: Date.now()
        }
        
        interaction.editReply({ embeds: [embed] })
    }
}