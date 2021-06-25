import { Client, Collection, Interaction } from "discord.js-light";
import { join, resolve } from "path";
import { readdirSync } from "fs";
import { Command } from "./Command";
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
            },
            intents: 1585
        })
        this.on("ready", () => {
            return console.log("Bot is ready");
        })
        this.on("interaction", this.handleInteraction)
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
    private handleInteraction(i: Interaction) {
        if (!i.isCommand()) return;
        i.reply("test")
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