import { REST } from "@discordjs/rest";
import { PrismaClient } from "@prisma/client";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, Interaction, Guild, ApplicationCommandPermissionData } from "discord.js";
import { exec } from "child_process";
/*import guildJson from "../database/guild.json";
import webhookJson from "../database/webhooks.json";
import feedsJson from "../database/feeds.json";*/
import { AutoPoster } from "topgg-autoposter";
import { readdirSync } from "fs";
import { join, resolve } from "path";
import { TwitterApi } from "twitter-api-v2";
import { clientOptions } from "../constants";
import TWStream from "../stream/stream";
import Command from "./Command";
import * as logger from "./Logger";
import { removeGuildData } from "../utils/functions";
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
require("dotenv").config();

export default class Tweetcord extends Client {
  public commands: Collection<string, Command>;
  public twitter: TwitterApi;
  public prisma: PrismaClient;
  public streamClient: TWStream;
  public userRateLimits: Collection<string, any>;
  public constructor() {
    super(clientOptions);
    this.on("ready", this.handleReady).on("interactionCreate", this.handleInteraction).on("guildDelete", this.handleLeave).on("error", console.error).on("warn", console.warn);
    this.commands = new Collection();
    this.userRateLimits = new Collection();
    this.twitter = new TwitterApi({
      appKey: process.env.TWITTER_APPKEY as string,
      appSecret: process.env.TWITTER_APPSECRET as string,
      accessToken: "1310499494912458755-xLht9pfcRkr1IBDfST5XNHeGjnJnNN",
      accessSecret: "BzLDhp9LJIvMSGIKT6MzDJup4a8z4FWX2oqr1GQkqwdY3",
    });
    this.prisma = new PrismaClient({ errorFormat: "colorless" });
    this.streamClient = new TWStream(this);
  }

  public async init(): Promise<void> {
    this.loadCommands();
    await this.login(process.env.DISCORD_TOKEN);
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
    try {
      if (!interaction.isCommand()) return;
      const command = this.commands.get(interaction.commandName);
      command?.run(interaction);
    } catch (e) {
      console.log("Error on interaction.");
    }
  }
  private handleLeave(e: Guild) {
    removeGuildData(this, e.id);
  }
  public async loadCommands(isReload?: Boolean) {
    const folder = resolve("dist/src/commands");
    const commands = readdirSync(folder).filter((c) => c.endsWith(".js"));
    for (const command of commands) {
      if (isReload) delete require.cache[join(folder, command)];
      const commandFile = await import(join(folder, command));
      const cmd: Command = new commandFile.default();
      this.commands.set(cmd.data().toJSON().name, cmd);
    }
  }
  public async reloadCommands() {
    exec("tsc", async (error) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      this.loadCommands(true);
    });
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
  public async sendTopGGStats() {
    try {
      AutoPoster("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Nzk1MTEwMjkxMzc0MDgwMSIsImJvdCI6dHJ1ZSwiaWF0IjoxNjA4OTY5NzA0fQ.uU5Y6O9K-lWPI0OZ1o3wyAYgokW30lYIx66JBKACL4Q", this).on(
        "posted",
        () => {
          return "Posted stats to Top.gg!";
        }
      );
    } catch (e) {
      return e;
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
  public async getBackup() {
    const { google } = require("googleapis");
    const SCOPES = ["https://www.googleapis.com/auth/drive"];

    const auth = new google.auth.GoogleAuth({
      scopes: SCOPES,
    });
    let feeds = await this.prisma.feed.findMany();
    let guild = await this.prisma.guild.findMany();
    let webhook = await this.prisma.webhook.findMany();
    let feedsStr = JSON.stringify(feeds);
    let guildStr = JSON.stringify(guild);
    let webhookStr = JSON.stringify(webhook);
    const driveService = google.drive({ version: "v3", auth });
    let date = new Date();
    let format = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    var folderMetaData = {
      name: format,
      mimeType: "application/vnd.google-apps.folder",
      parents: ["1Zmve1gkD0w0M8cB1u_Z3J712Am5e2yCB"],
    };

    driveService.files.create(
      {
        //@ts-ignore
        resource: folderMetaData,
        fields: "id",
      },
      async function (err: any, file: any) {
        if (err) return console.log(err);
        let list = ["webhooks", "feeds", "guilds"];
        for (let i = 0; i < list.length; i++) {
          let currentName = list[i];
          let current = {};
          switch (i) {
            case 0:
              current = webhookStr;
              break;
            case 1:
              current = feedsStr;
              break;
            case 2:
              current = guildStr;
              break;
          }
          let fileMetaData = {
            name: currentName + ".json",
            parents: [file.data.id],
          };
          let media = {
            mimeType: "application/json",
            body: current,
          };
          await driveService.files.create({
            //@ts-ignore
            resource: fileMetaData,
            media: media,
            fileds: "id",
          });
        }
      }
    );
  }
}
