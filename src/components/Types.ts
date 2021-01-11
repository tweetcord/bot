import { MessageEmbed, PermissionResolvable } from "discord.js";

export interface Options {
    token: string;
    owner: string | Array<string>;
    prefix: string;
}

export interface CommandOptions {
    triggers: Array<string>,
    help?: Object
    nsfwOnly?: Boolean;
    ownerOnly?: Boolean;
    supportServerOnly?: Boolean;
    userPermissions?: PermissionResolvable;
    botPermissions?: PermissionResolvable;    
}

export interface EventOptions {
    name: string,
    type: "on" | "once"
}