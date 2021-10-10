import { REST } from '@discordjs/rest';
import { PrismaClient } from "@prisma/client";
import { Routes } from 'discord-api-types/v9';
// import { init } from "@sentry/node";
import { ApplicationCommandPermissionData, Client, Collection, Interaction, Guild } from "discord.js";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import { TwitterApiReadOnly } from "twitter-api-v2";
import { clientOptions } from "../constants";
import TWStream from "../stream/stream"
import Command from "./Command";
import * as logger from "./Logger";

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

export default class Tweetcord extends Client {
  readonly commands: Collection<string, Command>;
  public twitter: TwitterApiReadOnly;
  public prisma: PrismaClient;
  public streamClient: TWStream;
  public constructor() {
    super(clientOptions);
    this
      .on("ready", this.handleReady)
      .on("interactionCreate", this.handleInteraction)
      .on("guildDelete", this.handleLeave)
      .on("error", console.error)
      .on("warn", console.warn);
    this.commands = new Collection();
    this.twitter = new TwitterApiReadOnly(process.env.TWITTER_BEARER);
    this.prisma = new PrismaClient({ errorFormat: "colorless" });
    this.streamClient = new TWStream(this)
  }

  public init(): void {
    this.loadCommands();
    this.login(process.env.DISCORD_TOKEN);
  }
  private handleReady(client: Client): void {
    logger.info("[BOT]", `Logged in as ${client.user?.tag} (${client.guilds.cache.size} guilds)`)
    /*
   sentry
   init({
     dsn: process.env.SENTRY,
     tracesSampleRate: 1.0,
     environment: "production"
   })
   logger.info("[SENTRY]", "Initialized Sentry")*/

    this.prisma.$connect().then(() => logger.info("[PRISMA]", "Connected to MongoDB"))
  }

  private handleInteraction(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    const command = this.commands.get(interaction.commandName);
    command?.run(interaction);
  }
  private handleLeave(e: Guild) {
    console.log(e.id);
    
  }
  private async loadCommands() {
    const folder = resolve("dist/src/commands")
    const commands = readdirSync(folder).filter(c => c.endsWith(".js"))

    for (const command of commands) {
      const commandFile = await import(join(folder, command))
      const cmd: Command = new commandFile.default()
      this.commands.set(cmd.data().toJSON().name, cmd)
    }
  }
  //@ts-ignore
  public async updateCommands() {
    const commands = this.commands.map(a => a.data().toJSON())
    const twdevserver = "686640167897006215"

    // bunu komutlari global yaptiginiz zaman guncelleyin:
    // this.application.commands.fetch("yeni komut idsi")
    const evalC = await this.guilds.cache.get(twdevserver)?.commands.fetch('859760246012248064');

    const permissions: ApplicationCommandPermissionData[] = [
      {
        id: '534099893979971584', // nmw03
        type: 'USER',
        permission: true,
      },
      {
        id: "548547460276944906", // can
        type: "USER",
        permission: true
      },
      {
        id: "693445343332794408", // kaan
        type: "USER",
        permission: true
      },
      {
        id: "300573341591535617", // woxe
        type: "USER",
        permission: true
      }
    ];

    try {
      await rest.put(
        // Global yapacaginiz zaman: Routes.applicationCommands
        Routes.applicationGuildCommands(this.user?.id as string, twdevserver),
        { body: commands },
      );
      // command permissions
      await evalC?.permissions.set({ permissions });

      logger.info('[SLASH]', `Successfully registered ${this.commands.size} application commands.`);
      return `Successfully registered ${this.commands.size} application commands.`
    } catch (error: any) {
      logger.error('[SLASH]', error);
      return error.message
    }
  }
}