import { PrismaClient } from "@prisma/client";
// import { init } from "@sentry/node";
import { Client, Collection, Interaction } from "discord.js";
import { readdir } from "fs/promises";
import { join, resolve } from "path";
import { TwitterApiReadOnly } from "twitter-api-v2";
import { clientOptions } from "../constants";
import Command from "./Command";
import * as logger from "./Logger";
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
    const folder = resolve("dist/commands")
    const commands = await readdir(folder)

    for await (const command of commands.filter(c => c.endsWith(".js"))) {
      const commandFile = await import(join(folder, command))
      //not finished
    }
  }
}
