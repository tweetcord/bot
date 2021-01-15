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

export default class Tweetcord extends Client {
    config: Options;
    logger: any
    commands: Collection<string, Command>;
    constructor(options: Options, clientOptions: ClientOptions) {
        super(clientOptions);
        this.config = options;
        this.logger = logger
        this.commands = new Collection()
    }
    private handleMessage(message: Message) {
        const channel = message.channel as TextChannel;
        if (!message.content.startsWith(this.config.prefix) || message.author.bot || message.webhookID || !channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
        const args = message.content.slice(this.config.prefix.length).trim().split(/ +w/g)
        const command: Command = this.findCommand(args.shift())
        if (command) {
            if (command.nsfwOnly && !channel.nsfw && this.config.owner !== message.author.id) {
                const embed = embeds.nsfw()
                return message.channel.send({ embed })
            }
            if (command.ownerOnly && message.author.id !== this.config.owner) {
                return message.channel.send(`${emojis.X} This command is restricted to bot developers.`)
            }

            try {
                return command.run(message, args)
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
                    console.log(commandName)
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