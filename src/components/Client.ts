import { Client, Collection, Message, MessageEmbed, TextChannel } from "discord.js-light";
import { join, resolve } from "path";
import { readdirSync } from "fs";
import { Command } from "./Command";
import { Args, Lexer, longStrategy, Parser } from "lexure";
import Twitter from "twitter-lite";


declare module "discord.js-light" {
    export interface Client {
        readonly commands: Collection<string, Command>
        twitter: Twitter
    }
}

export class Tweetcord extends Client {
    readonly commands: Collection<string, Command>;
    public twitter: Twitter
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
            // restRequestTimeout: 60e3,
            presence: {
                activity: {
                    name: "new things",
                    type: "WATCHING"
                }
            }
        })
        this.on("message", this.handleMessage)
        this.on("ready", () => {
            console.log("Bot is ready")
        })
        this.commands = new Collection();
        this.twitter = new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY!,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
            access_token_key: process.env.TWITTER_ACCESS_TOKEN,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        })
    }
    public init() {
        this.loadCommands(resolve('dist/commands'))
        this.login(process.env.DISCORD_TOKEN)
    }
    private findCommand(name: string): Command | undefined {
        return this.commands.get(name) ?? this.commands.find(a => a.triggers.includes(name))
    }
    private handleMessage(m: Message) {
        const prefix = "t."
        const channel = m.channel as TextChannel
        const owners = ["534099893979971584", "548547460276944906"]

        if (!m.content.startsWith(prefix) || m.author.bot || m.webhookID) return;

        const lexer = new Lexer(m.content).setQuotes([
            ['"', '"'],
            ['“', '”']
        ])
        const res = lexer.lexCommand(s => s.startsWith(prefix) ? prefix.length : null);
        if (!res) return;
        const parser = new Parser(res[1]()).setUnorderedStrategy(longStrategy());

        const command = this.findCommand(res[0].value)
        const args = new Args(parser.parse())
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

    private async loadCommands(folder: string) {
        const commandFiles = readdirSync(folder)

        for (const file of commandFiles) {
            const mod = await import(join(folder, file));
            const cmdClass = Object.values(mod).find((d: any) => d.prototype instanceof Command) as any;
            const cmd: Command = new cmdClass(this);

            this.commands.set(cmd.triggers[0], cmd);
        }
    }
}