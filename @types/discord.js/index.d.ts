import { Client, Collection } from "discord.js";
import Command from "@components/Command";
import Twitter from "twitter-lite";
import { PrismaClient } from "@prisma/client";

declare module "discord.js" {
  export interface Client {
    readonly commands: Collection<string, Command>;
    twitter: Twitter;
    prisma: PrismaClient;
  }
}
