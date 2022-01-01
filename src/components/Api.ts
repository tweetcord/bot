import express, { Request, Response } from "express";
import axios from "axios";
import cors from "cors";
import Tweetcord from "./Client";
import cookieParser from "cookie-parser";
import { TextChannel } from "discord.js";
import { TwitterApi } from "twitter-api-v2";
import { Feed, Guild } from "@prisma/client";
require("dotenv").config();

export default class App {
  public app: any;
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
    this.app.use(cookieParser());
  }

  public listen() {
    this.app.listen(3001);
  }
  private initializeRoutes() {
    this.app
      .post("/api/user", async (req: Request, res: Response) => {
        let userData = await this.getUserData(req, res);
        if (!userData.user) return;
        if (!userData.guilds) return res.send([]);
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
      .post("/api/guild", async (req: Request, res: Response) => {
        let userData = await this.getUserData(req, res);
        if (!userData) return;
        if (userData.error) return res.send(userData);
        let { user, guilds } = userData;
        let guildId = req.body.id;
        let discordGuild = this.client.guilds.cache.get(guildId);
        if (!discordGuild) return res.send({ error: 4043, message: "Can't find guild with provided ID." });
        if (!user || !guilds) return res.send({ error: 4040, message: "Can't access user's information." });
        let guild = guilds.find((guild: any) => guild.id === guildId);
        if (!(guild.permissions & 8)) return res.send({ error: 4031, message: "User doesn't have permissions to manage this guild." });
        let guildDb = await this.client.prisma.guild.findFirst({
          where: { id: guildId },
          include: {
            feeds: true,
          },
        });
        if (guildDb) {
          guildDb = await this.convertIDtoTwitterUser(guildDb);
        } else {
          guildDb = (await this.client.prisma.guild.create({
            data: {
              id: guildId,
            },
          })) as Guild & {
            feeds: Feed[];
          };
          guildDb.feeds = [];
        }
        let channels = discordGuild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT");
        return res.send({ ...guildDb, name: discordGuild.name, icon: discordGuild.icon, channels: channels });
      })
      .post("/api/feed/delete", async (req: Request, res: Response) => {
        let userData = await this.getUserData(req, res);
        if (userData.error) return res.send(userData);
        let { guilds } = userData;
        let feedId = req.body.feedId;
        let feed = await this.client.prisma.feed.findFirst({
          where: { id: feedId },
        });
        if (!feed) return res.send({ error: 4041, message: "Can't find feed with provided id." });
        let guild = guilds.find((guild: any) => guild.id === feed?.guildId);
        let discordGuild = this.client.guilds.cache.get(guild.id);
        if (!discordGuild) return res.send({ error: 4043, message: "Can't find guild with provided ID." });
        if (!(guild.permissions & 8)) return res.send({ error: 4031, message: "User doesn't have permissions to manage this guild." });
        await this.client.prisma.feed.deleteMany({
          where: {
            id: feedId,
          },
        });
        let guildDB = await this.client.prisma.guild.findFirst({
          where: { id: feed.guildId as string },
          include: {
            feeds: true,
          },
        });
        guildDB = await this.convertIDtoTwitterUser(guildDB);
        let channels = discordGuild?.channels.cache.filter((channel: any) => channel.type === "GUILD_TEXT");
        this.client.streamClient.restart();
        return res.send({ ...guildDB, name: guild.name, icon: guild.icon, channels: channels });
      })
      .post("/api/feeds", async (req: Request, res: Response) => {
        let feed = req.body;
        if (!feed || !feed.channel || !feed.guildId || !feed.twitterUserId) return res.send({ error: 4045, message: "Missing required fields." });
        let userData = await this.getUserData(req, res);
        if (userData.error) return res.send(userData);
        let { guilds } = userData;
        if (!(guilds.find((guild: any) => guild.id === feed.guildId).permissions & 8)) return res.send({ error: 4031, message: "User doesn't have permissions to manage this guild." });
        let guild = this.client.guilds.cache.get(feed.guildId);
        if (!guild) return res.send({ error: 4043, message: "Can't find guild with provided ID." });
        let guildDb = await this.client.prisma.guild.findFirst({
          where: { id: feed.guildId },
          include: {
            feeds: true,
            webhooks: true,
          },
        });
        if (guildDb && !guildDb.webhooks.find((webhook: any) => webhook.channelId === feed.channel)) {
          let channel = this.client.channels.cache.get(feed.channel) as TextChannel;
          let webhook = await channel?.createWebhook("Tweetcord Notification");
          if (!webhook) return res.send({ error: 4032, message: "Webhook creation failed" });
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
          if (!twitterUser) return res.send({ error: 4042, message: "Twitter user not found" });
          await this.client.prisma.feed.create({
            data: {
              channel: feed.channel,
              guildId: feed.guildId,
              twitterUserId: twitterUser.data.id,
              message: feed.message,
              replies: feed.replies,
              retweets: feed.retweets,
              keywords: feed.keywords,
            },
          });
        } else {
          let find = guildDb?.feeds.find((feed: any) => feed.twitterUserId === feed.twitterUserId);
          if (!find) return res.send({ error: 4041, message: "Feed not found" });
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
              keywords: feed.keywords,
            },
          });
        }
        let guildDB = await this.client.prisma.guild.findFirst({
          where: { id: feed.guildId },
          include: {
            feeds: true,
          },
        });
        guildDB = await this.convertIDtoTwitterUser(guildDB);
        let channels = guild.channels.cache.filter((channel) => channel.type === "GUILD_TEXT");
        this.client.streamClient.restart();
        return res.send({ ...guildDB, name: guild.name, icon: guild.icon, channels: channels });
      })
      .get("/auth/twitter", async (req: Request, res: Response) => {
        const { discordAuthToken } = req.query;
        console.log(discordAuthToken);
        if (!discordAuthToken) res.send({ error: 4040, message: "User not found" });
        res.cookie("discordAuthToken", discordAuthToken);

        const authLink = await this.client.twitter.generateAuthLink("https://api.tweetcord.xyz/auth/twitter/callback", { linkMode: "authorize" });
        let options = {
          maxAge: 1000 * 60 * 30,
        };
        res.cookie("authTokenS", authLink.oauth_token_secret, options);
        res.cookie("authToken", authLink.oauth_token, options);
        res.redirect(authLink.url);
      })
      .get("/auth/twitter/callback", async (req: Request, res: Response) => {
        const { oauth_token, oauth_verifier } = req.query;
        let authTokenS = req.cookies.authTokenS;
        if (!oauth_token || !oauth_verifier || !authTokenS) {
          return res.redirect("https://tweetcord.xyz/link");
        }
        let userData = await this.getUserData(req, res, req.cookies["discordAuthToken"]);
        if (userData.error) return res.send(userData);
        let user = userData.user;
        const userClient = new TwitterApi({
          appKey: process.env.TWITTER_APPKEY as string,
          appSecret: process.env.TWITTER_APPSECRET as string,
          accessToken: oauth_token as string,
          accessSecret: authTokenS,
        });
        userClient.login(oauth_verifier as string).then(async ({ client: _loggedClient, accessToken, accessSecret }) => {
          let dcUser = await this.client.prisma.user.findFirst({
            where: { id: user.id },
          });
          if (dcUser) {
            await this.client.prisma.user.update({
              where: { id: user.id },
              data: {
                accessToken,
                accessSecret,
              },
            });
          } else {
            await this.client.prisma.user.create({
              data: {
                id: user.id,
                accessToken,
                accessSecret,
              },
            });
          }
        });
        return res.redirect("https://tweetcord.xyz/link");
      })
      .post("/getLinkStatus", async (req: Request, res: Response) => {
        let userData = await this.getUserData(req, res);
        if (userData.error) return res.send(userData);
        let user = userData.user;
        let userDB = await this.client.prisma.user.findFirst({
          where: { id: user.id },
        });
        if (!userDB) return res.send({ code: 200, step: 1 });
        if (!(userDB as any).accessToken) return res.send({ code: 200, step: 1 });

        return res.send({ code: 200, step: 2 });
      })
      .post("/getTwitterUserData", async (req: Request, res: Response) => {
        let userData = await this.getUserData(req, res);
        if (userData.error) return res.send(userData);
        let user = userData.user;
        let userDB = await this.client.prisma.user.findFirst({
          where: { id: user.id },
        });
        if (!userDB) return res.send({ error: 4040, message: "User not found" });
        if (!(userDB as any).accessToken) return res.send({ error: 4043, message: "User not linked account." });
        let twitterClient = new TwitterApi({
          appKey: process.env.TWITTER_APPKEY as string,
          appSecret: process.env.TWITTER_APPSECRET as string,
          accessToken: userDB.accessToken,
          accessSecret: userDB.accessSecret,
        });
        let cureentTwitterUser = await twitterClient.currentUser();
        if (!cureentTwitterUser) return res.send({ error: 4044, message: "Can't find authorized Twitter account." });

        return res.send({ user: cureentTwitterUser });
      })
      .post("/logoutTwitter", async (req: Request, res: Response) => {
        let userData = await this.getUserData(req, res);
        if (userData.error) return res.send(userData);
        let user = userData.user;
        let userDB = await this.client.prisma.user.findFirst({
          where: { id: user.id },
        });
        if (!userDB) return res.send({ error: 4040, message: "User not found" });
        if (!userDB.accessToken) return res.send({ error: 4043, message: "User not linked account." });

        await this.client.prisma.user.update({
          where: { id: user.id },
          data: {
            accessToken: "",
            accessSecret: "",
          },
        });

        return res.send({ code: 200, message: "Logged out" });
      });
  }
  private async getUserData(req: Request, _res: Response, tokenA?: string): Promise<any> {
    let token = tokenA ? tokenA : req.headers.authorization;
    if (!token) return { error: 4030, message: "User not logged in." };
    let rateLimit = false;
    let data = await axios({ url: "https://discord.com/api/users/@me", headers: { Authorization: token, "Content-type": "application/json" } }).catch(() => {
      rateLimit = true;
    });
    let guilds = await axios({ url: "https://discord.com/api/users/@me/guilds", headers: { Authorization: token, "Content-type": "application/json" } }).catch(() => {
      rateLimit = true;
    });
    if (rateLimit) return { error: 4033, message: "You are being rate limited." };
    if (!data || !guilds) return { error: 4040, message: "Can't access users information." };

    return { user: data.data, guilds: guilds.data };
  }
  private convertIDtoTwitterUser = async (guildDb: any) => {
    let mappedId = new Set(guildDb.feeds.map((feed: any) => feed.twitterUserId));
    let idArr = Array.from(mappedId) as string[];
    if (idArr.length > 0) {
      let { data: users } = await this.client.twitter.v2.users(idArr, { "user.fields": ["profile_image_url", "description", "public_metrics"] });
      let mapDB = guildDb.feeds.map((feed: any) => {
        return {
          ...feed,
          user: users.find((user) => feed.twitterUserId === user.id),
        };
      });
      guildDb.feeds = mapDB;
    }
    return guildDb as Guild & { feeds: Feed[] };
  };
}
