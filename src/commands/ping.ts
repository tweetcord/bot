import { CommandInteraction } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Ping extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "ping"
        })
    }
    public reply(interaction: CommandInteraction): Promise<void> {
        // TODO: Add more information 
        return interaction.reply({
            content: this.bot.ws.ping.toString()
        });
    }
}