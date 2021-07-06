import { Client, Collection, Interaction, Message, Options } from "discord.js";
import { join, resolve } from "path";
import { readdirSync } from "fs";
import Twitter from "twitter-lite";
import { Command } from "./Command";

declare module "discord.js" {
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
            makeCache: Options.cacheWithLimits({
                MessageManager: 0,
                PresenceManager: 0,
                GuildBanManager: 0,
                GuildEmojiManager: 0,
                GuildEmojiRoleManager: 0,
                GuildMemberRoleManager: 0,
                GuildInviteManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0,
                StageInstanceManager: 0,
                ThreadManager: 0,
                ThreadMemberManager: 0,
                VoiceStateManager: 0
            }),
            restRequestTimeout: 60e3,
            presence: {
                activities: [{
                    name: "new things",
                    type: "WATCHING"
                }]
            },
            intents: 1585
        })
        this.on("ready", () => {
            return console.log("Bot is ready");
        })
        this.on("interactionCreate", this.handleInteraction)
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