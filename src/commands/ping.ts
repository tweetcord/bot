import { CommandInteraction } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "ping"
        })
    }
    public run(interaction: CommandInteraction): Promise<void> {
        return interaction.reply({
            content: `🏓 Pong! ${this.bot.ws.ping.toString()}`
        });
    }
}