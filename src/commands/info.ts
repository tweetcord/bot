const os = require("os");
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Formatters, version } from "discord.js";
import Command from "../components/Command";
import { iReply, resolveColor } from "../utils/functions";


export default class Info extends Command {
    public data() {
        return new SlashCommandBuilder().setName("info").setDescription("Information about bot");
    }
    public run(interaction: CommandInteraction): Promise<any> {
        return iReply(interaction, {
            embeds: [
                {
                    title: "Tweetcord",
                    description: Formatters.blockQuote("Imagine a bot... that allows you to interact with Twitter without leaving Discord"),
                    color: resolveColor("#1da0f6"),
                    fields: [
                        {
                            name: "Servers",
                            value: interaction.client.guilds.cache.size.toLocaleString(),
                            inline: true,
                        },
                        {
                            name: "RAM usage",
                            value: this.bytesToHRS(process.memoryUsage().rss),
                            inline: true,
                        },
                        {
                            name: "Uptime",
                            value: Formatters.time(Date.parse(interaction.client?.readyAt?.toString()!) / 1000, "R"),
                            inline: true,
                        },
                        {
                            name: `Discord.js version`,
                            value: version,
                            inline: true,
                        },
                        {
                            name: `Node.js version`,
                            value: process.version.replace("v", ""),
                            inline: true,
                        },
                        {
                            name: `Operating at`,
                            value: "CentOS, " + os.version(),
                            inline: true,
                        },
                    ],
                    footer: {
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                        text: interaction.user.tag,
                    },
                    timestamp: Date.now(),
                },
            ],
            components: [
                {
                    type: "ACTION_ROW",
                    components: [
                        {
                            style: "LINK",
                            type: "BUTTON",
                            url: "https://tweetcord.xyz",
                            label: "Visit our website",
                        },
                        {
                            style: "LINK",
                            type: "BUTTON",
                            url: interaction.client.generateInvite({ scopes: ["applications.commands", "bot"], permissions: 537218048n }),
                            label: "Invite me",
                        },
                        {
                            style: "LINK",
                            type: "BUTTON",
                            url: "https://top.gg/bot/677951102913740801/vote",
                            label: "Upvote",
                        },
                    ],
                },
            ],
        });
    }
    private bytesToHRS(bytes: number): string {
        if (Math.abs(bytes) < 1024) {
            return bytes + " B";
        }
        var units = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        var u = -1;
        do {
            bytes /= 1024;
            ++u;
        } while (Math.abs(bytes) >= 1024 && u < units.length - 1);
        return `${bytes.toFixed(2)} ${units[u]}`;
    }
}
