import { Client, ClientOptions, Collection, Message, TextChannel } from "discord.js-light";
import Command from "./Command";
import Event from "./Event";
import { join, resolve } from "path";
import { statSync, readdir, readdirSync } from "fs";
import * as logger from "./Logger";
import embeds from "./resources/Embeds"
import * as Sentry from '@sentry/node';
import * as emojis from "./resources/Emojis"
import TwitterClient from "./Twitter"
import ArgumentParser from "./Argument";
import * as config from "../settings.json";

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
        // const parser = new ArgumentParsr(message, this)
        // const [command, ...args] = parser.parse()
        const cmd: Command = this.findCommand(command)

        if (cmd) {
            if (cmd.nsfwOnly && !channel.nsfw && !owners.includes(message.author.id)) {
                const embed = embeds.nsfw()
                return message.channel.send({ embed })
            }
            if (cmd.ownerOnly && !owners.includes(message.author.id)) {
                return message.channel.send(`${emojis.X} This command is restricted to bot developers.`)
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

    private findCommand(name: string): Command | undefined {
        return this.commands.get(name) ?? this.commands.find(a => a.triggers.includes(name))
    }

    private loadCommands(): void {
        try {
            const files = readdirSync(join(__dirname, "..", "commands"));

            for (const category of files) {
                const cat = require(join(__dirname, "..", "commands", category))
                cat.forEach((name: string) => {
                    const command: Command = new (require(join(__dirname, "..", "commands", category, name)).default)(this);
                    this.commands.set(command.triggers[0], command)
                })
            }
        } catch (err) {
            Sentry.captureException(err)
            return console.error(err);
        }
    }

    private loadEvents(): void {
        try {
            const files = readdirSync(join(__dirname, "..", "events"));
            for (const name of files) {
                const event: Event = new (require(join(__dirname, "..", "events", name)).default)(this)
                if (event.type === 'once') this.once(event.name, event.run);
                this.on(event.name, event.run)
            }
        } catch (err) {
            Sentry.captureException(err)
            return console.error(err);
        }
    }

    public init() {
        Sentry.init({ dsn: config.SENTRY, tracesSampleRate: 0.2 })
        this.on("message", this.handleMessage)
        this.loadCommands()
        this.loadEvents()
        this.login(config.DISCORD_TOKEN)
    }

}