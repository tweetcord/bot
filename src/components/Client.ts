import { clientOptions } from "@/constants";
import Command from "@components/Command";
import { PrismaClient } from "@prisma/client";
import { init } from "@sentry/node";
import { Client, Collection, Interaction } from "discord.js";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import Twitter, { TwitterApiReadOnly } from "twitter-api-v2";

export default class Tweetcord extends Client {
  readonly commands: Collection<string, Command>;
  public twitter: TwitterApiReadOnly;
  public prisma: PrismaClient;

  public constructor() {
    super(clientOptions);

    this.on("ready", () => {
      return console.log("Bot is ready");
    });

    this.on("interactionCreate", this.handleInteraction);

    this.on("error", console.error);

    this.on("warn", console.warn);

    this.commands = new Collection();

    this.twitter = new Twitter(process.env.TWITTER_BEARER as string).readOnly

    this.prisma = new PrismaClient({
      errorFormat: "colorless",
    });
  }

  public init(): void {
    this.loadCommands(resolve("dist/commands"));
    this.login(process.env.DISCORD_TOKEN);
    // sentry
    init({
      dsn: process.env.SENTRY,
      tracesSampleRate: 1.0,
    });
    this.prisma.$connect();
  }

  private handleInteraction(i: Interaction) {
    if (!i.isCommand()) return;
    const command = this.findCommand(i.commandName);
    command?.reply(i);
  }

  private findCommand(name: string): Command | undefined {
    return this.commands.get(name);
  }

  private async loadCommands(folder: string) {
    const commands = readdirSync(folder);

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
