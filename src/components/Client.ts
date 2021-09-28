import { REST } from '@discordjs/rest';
import { PrismaClient } from "@prisma/client";
import { Routes } from 'discord-api-types/v9';
// import { init } from "@sentry/node";
import { Client, Collection, Interaction } from "discord.js";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import { TwitterApiReadOnly } from "twitter-api-v2";
import { clientOptions } from "../constants";
import Command from "./Command";
import * as logger from "./Logger";

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

export default class Tweetcord extends Client {
  readonly commands: Collection<string, Command>;
  public twitter: TwitterApiReadOnly;
  public prisma: PrismaClient;
  public constructor() {
    super(clientOptions);
    this
      .on("ready", this.handleReady)
      .on("interactionCreate", this.handleInteraction)
      .on("error", console.error)
      .on("warn", console.warn);
    this.commands = new Collection();
    this.twitter = new TwitterApiReadOnly(process.env.TWITTER_BEARER);
    this.prisma = new PrismaClient({ errorFormat: "colorless" });
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
   logger.info("[SENTRY]", "Initialized Sentry")
   this.prisma.$connect().then(() => logger.info("[PRISMA]", "Connected to MongoDB"))
 */
  }

  private handleInteraction(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    const command = this.commands.get(interaction.commandName);
    command?.run(interaction);
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
    try {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_SERVER),
        { body: commands },
      );
      logger.info('[SLASH]', 'Successfully registered application commands.');
    } catch (error) {
      logger.error('[SLASH]', error);
    }
  }
}
