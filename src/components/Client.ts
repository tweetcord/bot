import { Client, Collection, Message, TextChannel } from "discord.js-light";
import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { Command } from "./Command";

export class Tweetcord extends Client {
    private readonly commands: Collection<string, Command>;
    public constructor() {
        super({
            allowedMentions: {
                parse: ["users"]
            },
            cacheChannels: false,
            cacheEmojis: false,
            cachePresences: false,
            cacheRoles: false,
            messageCacheMaxSize: 0,
            messageEditHistoryMaxSize: 0,
            restRequestTimeout: 60e3,
            presence: {
                activity: {
                    name: "new things",
                    type: "WATCHING"
                }
            }
        })
        this.on("message", this.handleMessage)
        this.commands = new Collection();
    }
    public init() {

    }
    private findCommand(name: string): Command | undefined {
        return this.commands.get(name) ?? this.commands.find(a => a.triggers.includes(name))
    }
    private handleMessage(m: Message) {
        const prefix = "t."
        const channel = m.channel as TextChannel
        const owners = ["534099893979971584", "548547460276944906"]

        if (!m.content.startsWith(prefix) || m.author.bot || m.webhookID) return;
        const [cmd, ...args] = m.content.slice(prefix.length).trim().split(/ +/g)
        const command = this.findCommand(cmd)

        if (command) {
            if (command.nsfwOnly && !channel.nsfw && !owners.includes(m.author.id)) {
                return m.channel.send({
                    embed: {
                        "title": "You have to use this command in NSFW marked channels.",
                        "url": "https://support.discord.com/hc/en-us/articles/115000084051-NSFW-Channels-and-Content",
                        "color": 16711680,
                        "timestamp": Date.now(),
                        "footer": {
                            "text": "If you wonder why, look at Discord Guidelines #6"
                        },
                        "image": {
                            "url": "https://i.imgur.com/W1XfLOe.gif"
                        }
                    }
                })
            }
            if (command.ownerOnly && !owners.includes(m.author.id)) {
                return m.channel.send(`This command is restricted to bot developers.`)
            }
            return command.execute(m, args)

        }
    }

    private parseArgs(m) {
        
    }
    private async loadCommands(folder: string) {
        const commandFiles = readdirSync(folder).filter((file) => file.endsWith(".ts"));

        for (const file of commandFiles) {
            const mod = await import(join(folder, file));
            const cmdClass = Object.values(mod).find((d: any) => d.prototype instanceof Command) as any;
            const cmd: Command = new cmdClass(this);

            this.commands.set(cmd.triggers[0], cmd);
        }
    }
}