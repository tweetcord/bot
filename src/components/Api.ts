import express from "express";
import axios from "axios";
import cors from "cors";
import Tweetcord from "./Client";
import { TextChannel } from "discord.js";
export default class App {
  public app: express.Application;
  public client: Tweetcord;
  constructor(client: Tweetcord) {
    this.app = express();
    this.client = client;
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  public listen() {
    this.app.listen(3001);
  }
  private initializeRoutes() {
    this.app
      .post("/api/user", async (req, res) => {
        let userData = await this.getUserData(req, res);
        if (!userData) return res.sendStatus(403);
        let guilds = userData.guilds;
        let mapped = guilds
          .filter((guild: any) => guild.permissions & 8)
          .map(async (guild: any) => {
            if (this.client.guilds.cache.get(guild.id)) {
              guild.isTweetcordIn = true;
              guild.database = await this.client.prisma.guild.findFirst({
                where: { id: guild.id },
                include: {
                  feeds: true,
                },
              });
            } else {
              guild.isTweetcordIn = false;
            }
            return guild;
          });
        Promise.all(mapped).then((guilds) => {
          return res.send(guilds);
        });
        return;
      })
      .post("/api/guild", async (req, res) => {
        let userData = await this.getUserData(req, res);
        if (!userData) return res.sendStatus(403);
        let { user, guilds } = userData;
        let guildId = req.body.id;
        let discordGuild = this.client.guilds.cache.get(guildId);
        if (!discordGuild) return res.sendStatus(404);
        if (!user || !guilds) return res.sendStatus(404);
        let guild = guilds.find((guild: any) => guild.id === guildId);
        if (!(guild.permissions & 8)) return res.sendStatus(403);
        let guildDb = await this.client.prisma.guild.findFirst({
          where: { id: guildId },
          include: {
            feeds: true,
          },
        });
        if (guildDb) {
          let mappedId = new Set(guildDb.feeds.map((feed) => feed.twitterUserId));
          let idArr = Array.from(mappedId);
          if (idArr.length > 0) {
            let { data: users } = await this.client.twitter.v2.users(idArr, { "user.fields": ["profile_image_url", "description", "public_metrics"] });
            let mapDB = guildDb.feeds.map((feed) => {
              return {
                ...feed,
                user: users.find((user) => feed.twitterUserId === user.id),
              };
            });
            guildDb.feeds = mapDB;
          }
        }
        let channels = discordGuild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT");
        return res.send({ ...guildDb, name: discordGuild.name, icon: discordGuild.icon, channels: channels });
      })
      .post("/api/feed/delete", async (req, res) => {
        let userData = await this.getUserData(req, res);
        if (!userData) return res.sendStatus(403);
        let { guilds } = userData;
        let feedId = req.body.feedId;
        let feed = await this.client.prisma.feed.findFirst({
          where: { id: feedId },
        });
        if (!feed) return res.sendStatus(404);
        let guild = guilds.find((guild: any) => guild.id === feed?.guildId);
        if (!(guild.permissions & 8)) return res.sendStatus(403);
        await this.client.prisma.feed.deleteMany({
          where: {
            id: feedId,
          },
        });
        return res.sendStatus(200);
      })
      .post("/api/feeds", async (req, res) => {
        let feed = req.body;
        let userData = await this.getUserData(req, res);
        if (!userData) return res.sendStatus(403);
        let { guilds } = userData;
        if (!(guilds.find((guild: any) => guild.id === feed.guildId).permissions & 8)) return res.sendStatus(403);
        let guild = this.client.guilds.cache.get(feed.guildId);
        if (!guild) return res.sendStatus(404);
        let guildDb = await this.client.prisma.guild.findFirst({
          where: { id: feed.guildId },
          include: {
            feeds: true,
            webhooks: true,
          },
        });
        if (guildDb && !guildDb.webhooks.find((webhook) => webhook.channelId === feed.channel)) {
          let channel = this.client.channels.cache.get(feed.channel) as TextChannel;
          let webhook = await channel?.createWebhook("Tweetcord Notification");
          if (!webhook) return res.send({ code: 403, message: "Webhook creation failed" });
          await this.client.prisma.webhook.create({
            data: {
              webhookId: webhook.id,
              webhookToken: webhook.token as string,
              guildId: feed.guildId,
              channelId: feed.channel,
            },
          });
        }
        if (feed.twitterUserId === "newUser") {
          let twitterUser = await this.client.twitter.v2.userByUsername(feed.user.username.replace("@", ""));
          if (!twitterUser) return res.send({ code: 403, message: "Twitter user not found" });
          await this.client.prisma.feed.create({
            data: {
              channel: feed.channel,
              guildId: feed.guildId,
              twitterUserId: twitterUser.data.id,
              message: feed.message,
              replies: feed.replies,
              retweets: feed.retweets,
            },
          });
        } else {
          let find = guildDb?.feeds.find((feed) => feed.twitterUserId === feed.twitterUserId);
          if (!find) return res.send({ code: 404, message: "Feed not found" });
          if (find === feed) return;
          await this.client.prisma.feed.update({
            where: {
              id: find.id,
            },
            data: {
              channel: find.channel,
              guildId: find.guildId,
              twitterUserId: find.twitterUserId,
              message: feed.message,
              replies: feed.replies,
              retweets: feed.retweets,
            },
          });
        }
        return res.sendStatus(200);
      });
  }

  private async getUserData(req: any, res: any): Promise<any> {
    let token = req.headers.authorization;
    if (!token) return res.sendStatus(403);
    let data = await axios({ url: "https://discord.com/api/users/@me", headers: { Authorization: token, "Content-type": "application/json" } }).catch(() => {});
    let guilds = await axios({ url: "https://discord.com/api/users/@me/guilds", headers: { Authorization: token, "Content-type": "application/json" } }).catch(() => {});
    if (!data || !guilds) return;
    console.log(data.data);
    return { user: data.data, guilds: guilds.data };
  }
}
