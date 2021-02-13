import { Client, ClientOptions, Collection, Message, TextChannel } from "discord.js-light";
import Command from "./Command";
import Event from "./Event";
import { join, resolve } from "path";
import { statSync, readdir } from "fs";
import * as logger from "./Logger";
import embeds from "./resources/Embeds"
import * as Sentry from '@sentry/node';
import * as emojis from "./resources/Emojis"
import TwitterClient from "./Twitter"
import { config } from "dotenv";

config({
    path: join("..", ".env")
});

export default class Tweetcord extends Client {
    logger: any
    commands: Collection<string, Command>;
    twitter: TwitterClient

    constructor(clientOptions: ClientOptions) {
        super(clientOptions);
        this.logger = logger
        this.commands = new Collection()
        this.twitter = new TwitterClient()
    }
    private handleMessage(message: Message) {
        const channel = message.channel as TextChannel;
        if (!message.content.startsWith("t.") || message.author.bot || message.webhookID) return;
        const owners = ["534099893979971584", "548547460276944906"]
        const [command, ...args] = message.content.slice(2).trim().split(/ +/g)
        const cmd: Command = this.findCommand(command)
        if (cmd) {
            if (cmd.nsfwOnly && !channel.nsfw && !owners.includes(message.author.id)) {
                const embed = embeds.nsfw()
                return message.channel.send({ embed })
            }
            if (cmd.ownerOnly && !owners.includes(message.author.id)) {
                return message.channel.send(`${emojis.X} This command is restricted to bot developers.`)
            }
            if (cmd.botPermissions) {
                const missing = []
                for (const perm of cmd.botPermissions) {
                    if (!message.guild.me.permissions.has(perm)) missing.push(perm)
                }
                return message.channel.send(`
                ${emojis.X} I am missing following permissions to run this command:
                 \`\`\`diff\n- ${missing.map(a => a).join("\n- ")}\`\`\`
                `)
            }
            if (cmd.userPermissions) {
                const missing = []
                for (const perm of cmd.userPermissions) {
                    if (!message.member.permissions.has(perm)) missing.push(perm)
                }
                return message.channel.send(`
                ${emojis.X} You are missing following permissions to run this command:
                 \`\`\`diff\n- ${missing.map(a => a).join("\n- ")}\`\`\`
                `)
            }
            try {
                return cmd.run(message, args)
            } catch (e) {
                Sentry.captureException(e)
                this.logger.error(e);
                return message.channel.send(e)
            }

        }
    }

    private findCommand(name: string) {
        return this.commands.get(name) ?? this.commands.find(a => a.triggers.includes(name))
    }

    private loadCommands(dir) {
        try {
            readdir(dir, (err: Error, commands) => {
                if (err) throw err;
                for (const commandName of commands) {
                    const stat = statSync(dir + "/" + commandName)
                    if (stat.isDirectory()) return this.loadCommands(dir + "/" + commandName);
                    const path = dir + '/' + commandName;
                    const command: Command = new (require(resolve(path)).default)(this)
                    this.commands.set(command.triggers[0], command)
                }
                return true;
            })
        } catch (error) {
            Sentry.captureException(error)
            this.logger.error(error)
            return false;
        }
    }

    private loadEvents(dir) {
        try {
            readdir(dir, (err: Error, events) => {
                if (err) throw err;
                for (const eventName of events) {
                    const path = dir + '/' + eventName;
                    const event: Event = new (require(resolve(path)).default)(this)
                    if (event.type === "once") this.once(event.name, event.run)
                    this.on(event.name, event.run)
                }
                return true;
            })

        } catch (error) {
            Sentry.captureException(error)
            this.logger.error(error)
            return false;
        }
    }

    public init() {
        Sentry.init({ dsn: process.env.SENTRY, tracesSampleRate: 0.2 })
        this.on("message", this.handleMessage)
        this.loadCommands(resolve("commands"))
        this.loadEvents(resolve("events"))
        console.log(process.env);
        this.login(process.env.DISCORD_TOKEN)
    }

}