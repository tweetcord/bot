import { CommandInteraction, Formatters, version } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Stats extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "stats"
        })
    }
    public reply(interaction: CommandInteraction): Promise<void> {
        return interaction.reply({
            embeds: [{
                title: "Tweetcord",
                description: Formatters.blockQuote("Imagine a bot... that allows you to interact with Twitter without leaving Discord"),
                fields: [
                    {
                        name: "Servers",
                        value: this.bot.guilds.cache.size.toLocaleString(),
                        inline: true
                    },
                    {
                        name: "RAM usage",
                        value: this.bytesToHRS(process.memoryUsage().rss),
                        inline: true
                    },
                    {
                        name: "Uptime",
                        value: Formatters.time(Date.parse(this.bot?.readyAt?.toString()!) / 1000, "R"),
                        inline: true
                    },
                    {
                        name: `${Formatters.formatEmoji("880242179879096320")} Discord.js version`,
                        value: version,
                        inline: true
                    }
                ],
                footer: {
                    iconURL: "https://cdn.discordapp.com/emojis/869705214452719696.png",
                    text: "Ubuntu v20.04"
                },
                timestamp: Date.now()
            }],
            components: [{
                type: "ACTION_ROW",
                components: [
                    {
                        style: "LINK",
                        type: "BUTTON",
                        url: "https://tweetcord.xyz",
                        label: "Visit our website"
                    },
                    {
                        style: "LINK",
                        type: "BUTTON",
                        url: this.bot.generateInvite({ scopes: ["applications.commands", "bot"], permissions: 537259072n }),
                        label: "Invite me"
                    },
                    {
                        style: "LINK",
                        type: "BUTTON",
                        url: "https://top.gg/bot/677951102913740801/vote",
                        label: "Upvote"
                    }
                ]
            }]
        });
    }
    private bytesToHRS(bytes: number): string {
        if (Math.abs(bytes) < 1024) {
            return bytes + ' B';
        }
        var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        var u = -1;
        do {
            bytes /= 1024;
            ++u;
        } while (Math.abs(bytes) >= 1024 && u < units.length - 1);
        return bytes.toFixed(1) + ' ' + units[u];
    }
}