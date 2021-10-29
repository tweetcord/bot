import { REST } from "@discordjs/rest";
import { PrismaClient } from "@prisma/client";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, Interaction, Guild, ApplicationCommandPermissionData, Message } from "discord.js";
/*import guildJson from "../database/guild.json";
import webhookJson from "../database/webhooks.json";
import feedsJson from "../database/feeds.json";*/
import { readdirSync } from "fs";
import { join, resolve } from "path";
import { TwitterApiReadOnly } from "twitter-api-v2";
import { clientOptions } from "../constants";
import TWStream from "../stream/stream";
import Command from "./Command";
import * as logger from "./Logger";
import { removeGuildData } from "../utils/functions";
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

export default class Tweetcord extends Client {
    readonly commands: Collection<string, Command>;
    public twitter: TwitterApiReadOnly;
    public prisma: PrismaClient;
    public streamClient: TWStream;
    public constructor() {
        super(clientOptions);
        this.on("ready", this.handleReady).on("interactionCreate", this.handleInteraction).on("guildDelete", this.handleLeave).on("messageCreate", this.handleMessageEvent).on("error", console.error).on("warn", console.warn);
        this.commands = new Collection();
        this.twitter = new TwitterApiReadOnly(process.env.TWITTER_BEARER);
        this.prisma = new PrismaClient({ errorFormat: "colorless" });
        this.streamClient = new TWStream(this);
    }

    public init(): void {
        this.loadCommands();
        this.login(process.env.DISCORD_TOKEN);
    }
    private async handleReady(client: Client): Promise<void> {
        logger.info("[BOT]", `Logged in as ${client.user?.tag} (${client.guilds.cache.size} guilds)`);
        /*await this.prisma.guild.createMany({ data: guildJson });
        await this.prisma.webhook.createMany({ data: webhookJson });
        await this.prisma.feed.createMany({ data: feedsJson });*/
        this.prisma.$connect().then(() => {
            logger.info("[PRISMA]", "Connected to MongoDB");
            this.streamClient.start();
        });
    }

    private handleInteraction(interaction: Interaction) {
        if (!interaction.isCommand()) return;
        const command = this.commands.get(interaction.commandName);
        command?.run(interaction);
    }
    private handleMessageEvent(m: Message) {
        if (!m.content.startsWith("tw") || !m.content.split(" ")[1]) return;
        if (["f-add", "feed", "f-list", "f-remove", "help", "invite", "ping", "s-tweet", "s-user", "search", "stats", "trend", "user"].includes(m.content.split(" ")[1])) {
            m.reply(`We have migrated to slash commands, type \`/help\` for more information.`);
        }
    }
    private handleLeave(e: Guild) {
        removeGuildData(this, e.id);
    }
    private async loadCommands() {
        const folder = resolve("dist/src/commands");
        const commands = readdirSync(folder).filter((c) => c.endsWith(".js"));

        for (const command of commands) {
            const commandFile = await import(join(folder, command));
            const cmd: Command = new commandFile.default();
            this.commands.set(cmd.data().toJSON().name, cmd);
        }
    }
    //@ts-ignore
    private async addEvalCommand() {
        const commands = this.commands.map((a) => a.data().toJSON()).filter((a) => a.name === "eval");
        const twdevserver = "686640167897006215";
        let evalC = (await this.guilds.cache.get(twdevserver)?.commands.fetch())?.find((a) => a.name === "eval");

        const permissions: ApplicationCommandPermissionData[] = [
            {
                id: "534099893979971584", // nmw03
                type: "USER",
                permission: true,
            },
            {
                id: "548547460276944906", // can
                type: "USER",
                permission: true,
            },
            {
                id: "693445343332794408", // kaan
                type: "USER",
                permission: true,
            },
            {
                id: "300573341591535617", // woxe
                type: "USER",
                permission: true,
            },
        ];

        try {
            await rest.put(Routes.applicationGuildCommands(this.user?.id as string, twdevserver), { body: commands });
            await evalC?.permissions.set({ permissions });

            logger.info("[SLASH]", `Successfully registered ${this.commands.size} application commands.`);
            return `Successfully registered ${this.commands.size} application commands.`;
        } catch (error: any) {
            logger.error("[SLASH]", error);
            return error.message;
        }
    }

    public async setGlobalCommands() {
        const commands = this.commands.map((a) => a.data().toJSON()).filter((a) => a.name !== "eval");
        try {
            await rest.put(
                // Global yapacaginiz zaman: Routes.applicationCommands
                Routes.applicationCommands(this.user?.id as string),
                { body: commands }
            );

            logger.info("[SLASH]", `Successfully registered ${this.commands.size} application commands.`);
            return `Successfully registered ${this.commands.size} application commands.`;
        } catch (error: any) {
            logger.error("[SLASH]", error);
            return error.message;
        }
    }

    public async setTestCommands() {
        const commands = this.commands.map((a) => a.data().toJSON());
        const twdevserver = "686640167897006215";
        let evalC = (await this.guilds.cache.get(twdevserver)?.commands.fetch())?.find((a) => a.name === "eval");

        const permissions: ApplicationCommandPermissionData[] = [
            {
                id: "534099893979971584", // nmw03
                type: "USER",
                permission: true,
            },
            {
                id: "548547460276944906", // can
                type: "USER",
                permission: true,
            },
            {
                id: "693445343332794408", // kaan
                type: "USER",
                permission: true,
            },
            {
                id: "300573341591535617", // woxe
                type: "USER",
                permission: true,
            },
        ];

        try {
            await rest.put(Routes.applicationGuildCommands(this.user?.id as string, "686640167897006215"), { body: commands });
            await evalC?.permissions.set({ permissions });

            logger.info("[SLASH]", `Successfully registered ${this.commands.size} application commands.`);
            return `Successfully registered ${this.commands.size} application commands.`;
        } catch (error: any) {
            logger.error("[SLASH]", error);
            return error.message;
        }
    }
}
