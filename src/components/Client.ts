import { PrismaClient } from "@prisma/client";
import { init } from "@sentry/node";
import { Client, Collection, Interaction } from "discord.js";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import { TwitterApiReadOnly } from "twitter-api-v2";
import { clientOptions } from "../constants";
import Command from "./Command";
import { logger } from "./Logger"
export default class Tweetcord extends Client {
  readonly commands: Collection<string, Command>;
  public twitter: TwitterApiReadOnly;
  public prisma: PrismaClient;

  public constructor() {
    super(clientOptions);
    this.on("ready", this.handleReady);
    this.on("interactionCreate", this.handleInteraction);
    this.on("error", console.error);
    this.on("warn", console.warn);
    this.commands = new Collection();
    this.twitter = new TwitterApiReadOnly(process.env.TWITTER_BEARER)
    this.prisma = new PrismaClient({ errorFormat: "colorless" });
  }

  public init(): void {
    this.loadCommands(resolve("dist/commands"));
    this.login(process.env.DISCORD_TOKEN);
  }
  private handleReady(client: Client): void {
    logger.info("\u25CF", `${client.user?.tag} is online`)
    // sentry
    init({
      dsn: process.env.SENTRY,
      tracesSampleRate: 1.0,
    });
    this.prisma.$connect()
  }
  private handleInteraction(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    const command = this.commands.get(interaction.commandName);
    command?.reply(interaction);
  }

  private async loadCommands(folder: string) {
    const commands = readdirSync(folder).filter(a => a.endsWith(".js"))

    for (const command of commands) {
      const mod = await import(join(folder, command));
      const cmdClass = Object.values(mod).find(
        (d: any) => d.prototype instanceof Command
      ) as any;
      const cmd: Command = new cmdClass(this);
      this.commands.set(cmd.name, cmd);
    }
  }
}
