import { PrismaClient } from "@prisma/client";
import { Collection } from "discord.js";
import { TwitterApiReadOnly } from "twitter-api-v2";
import Command from "../components/Command";

declare module "discord.js" {
  export interface Client {
    readonly commands: Collection<string, Command>;
    twitter: TwitterApiReadOnly;
    prisma: PrismaClient;
  }
}