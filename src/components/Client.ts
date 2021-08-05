import { PrismaClient } from "@prisma/client";
import { init } from "@sentry/node";
import { Client, Collection, Interaction, Options } from "discord.js";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import Twitter from "twitter-lite";
import Command from "./Command";

declare module "discord.js" {
    export interface Client {
        readonly commands: Collection<string, Command>
        twitter: Twitter
        prisma: PrismaClient
    }
}

export default class Tweetcord extends Client {
    readonly commands: Collection<string, Command>;
    public twitter: Twitter
    public prisma: PrismaClient
    public constructor() {
        super({
            allowedMentions: {
                parse: ["users"],
                repliedUser: true
            },
            userAgentSuffix: [
                "Tweetcord/1.0.0"
            ],
            makeCache: Options.cacheWithLimits({
                MessageManager: 0,
                PresenceManager: 0,
                GuildBanManager: 0,
                GuildMemberManager: {
                    maxSize: 0,
                    keepOverLimit: (v) => v.id === v.client.user!.id
                },
                BaseGuildEmojiManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                VoiceStateManager: 0,
                UserManager: {
                    maxSize: 0,
                    keepOverLimit: (v) => v.id === v.client.user!.id
                },
                GuildInviteManager: 0,
                GuildStickerManager: 0
            }),
            restRequestTimeout: 60e3,
            presence: {
                activities: [{
                    name: "you",
                    type: "WATCHING"
                }]
            },
            intents: 1585
        })
        this.on("ready", () => {
            return console.log("Bot is ready");
        })
        this.on("interactionCreate", this.handleInteraction)
        this.on("error", console.error)
        this.on("warn", console.warn)
        this.commands = new Collection();
        this.twitter = new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY!,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET!,
            access_token_key: process.env.TWITTER_ACCESS_TOKEN,
            access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
        })
        this.prisma = new PrismaClient({
            errorFormat: "colorless"
        })
    }
    public init(): void {
        this.loadCommands(resolve('dist/commands'))
        this.login(process.env.DISCORD_TOKEN)
        init({
            dsn: process.env.SENTRY,
            tracesSampleRate: 1.0
        })
        this.prisma.$connect()
    }
    private handleInteraction(i: Interaction) {
        try {
            if (!i.isCommand()) return;
            const command = this.findCommand(i.commandName)
            command?.reply(i);
        } catch (e) {
            console.error(e);
        }
    }
    private findCommand(name: string): Command | undefined {
        return this.commands.get(name)
    }
    private async loadCommands(folder: string) {
        const commands = readdirSync(folder);

        for (const command of commands) {
            const mod = await import(join(folder, command));
            const cmdClass = Object.values(mod).find((d: any) => d.prototype instanceof Command) as any;
            const cmd: Command = new cmdClass(this);
            this.commands.set(cmd.name, cmd)
        }
    }
}