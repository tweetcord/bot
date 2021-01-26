import { Client, ClientOptions, Collection, Message, TextChannel } from "discord.js";
import Command from "./Command";
import Event from "./Event";
import { resolve } from "path";
import { statSync, readdir } from "fs";
import { Options } from "./Types";
import * as logger from "./Logger";
import embeds from "./resources/Embeds"
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import * as emojis from "./resources/Emojis"
import { StatsD } from "hot-shots";
import Twitter from "twitter-lite"

export default class Tweetcord extends Client {
    config: Options;
    logger: any
    commands: Collection<string, Command>;
    ddog: StatsD
    twitter: Twitter
    constructor(options: Options, clientOptions: ClientOptions) {
        super(clientOptions);
        this.config = options;
        this.logger = logger
        this.commands = new Collection()
        this.ddog = new StatsD({
            port: 8080,
            errorHandler: Sentry.captureException
        })
        this.twitter = new Twitter({
            consumer_key: 'akDdJn4rNUlmKywGt15bJmscD',
            consumer_secret: 'd7GUatwC2g7wWRtKRhe253NFJjqCN6rRbxHzUqo1gvLNz62B4H',
            access_token_key: '4061434829-brpl5WlaDyol0p2WrzFLghMVtKo3xu5h35MC44T',
            access_token_secret: 'ON1vIv7qrGjg4Yl6nW1b3MaOT10lkE8aOBZ56zukcSYau'
        })
    }
    private handleMessage(message: Message) {
        this.ddog.increment("messages")
        const channel = message.channel as TextChannel;
        if (!message.content.startsWith(this.config.prefix) || message.author.bot || message.webhookID || !channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
        const [command, ...args] = message.content.slice(this.config.prefix.length).trim().split(/ +/g)
        const cmd: Command = this.findCommand(command)
        if (cmd) {
            if (cmd.nsfwOnly && !channel.nsfw && this.config.owner !== message.author.id) {
                const embed = embeds.nsfw()
                return message.channel.send({ embed })
            }
            if (cmd.ownerOnly && message.author.id !== this.config.owner) {
                return message.channel.send(`${emojis.X} This command is restricted to bot developers.`)
            }
            try {
                this.ddog.increment("commandExecuted")
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
        Sentry.init({ dsn: this.config.sentry, tracesSampleRate: 0.2 })
        this.on("message", this.handleMessage)
        this.loadCommands(resolve("commands"))
        this.loadEvents(resolve("events"))
        this.login(this.config.token)
    }

}