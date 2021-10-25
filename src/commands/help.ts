import { SlashCommandBuilder, hyperlink } from "@discordjs/builders";
import { CommandInteraction, MessageEmbedOptions } from "discord.js";
import Command from "../components/Command";

export default class Help extends Command {
    public data() {
        return new SlashCommandBuilder().setName("help").setDescription("Get help about Tweetcord.");
    }
    public async run(interaction: CommandInteraction): Promise<void> {
        let commandName = interaction.options.getString("command");
        let embed: MessageEmbedOptions = {
            author: {
                name: "Tweetcord",
            },
            description: `If you need help join ${hyperlink("support server", "https://discord.com/invite/tV22Kvj")}.`,
            color: "#1da0f2",
            fields: [
                { name: "**Feed**", value: "`/feed add`, `/feed remove`, `/feed list`" },
                { name: "**Search**", value: "`/search tweet`, `/search user`" },
                { name: "**General**", value: "`/help`, `/invite`, `/user`, `/tweets`, `/trends`" },
            ],
            timestamp: new Date(),
        };

        return interaction.reply({
            embeds: [embed],
            ephemeral: commandName ? true : false,
        });
    }
}
