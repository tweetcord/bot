import { MessageEmbed, PermissionResolvable, Permissions, Snowflake } from "discord.js";

export interface Options {
    token: string;
    owner: string | Array<string>;
    prefix: string;
    sentry: string;
}

export interface CommandOptions {
    triggers: Array<string>,
    help?: Object
    nsfwOnly?: Boolean;
    ownerOnly?: Boolean;
    supportServerOnly?: Boolean;
    userPermissions?: Array<PermissionResolvable>
    botPermissions?: Array<PermissionResolvable>  
}

export interface EventOptions {
    name: string,
    type: "on" | "once"
}

export interface TopGGVote {
    bot: Snowflake
    user: Snowflake
    type: string
    query: string
    isWeekend: boolean
}