import { Message, BitFieldResolvable, PermissionString, Snowflake } from 'discord.js';
import { Args } from 'lexure';

interface CommandFlags {
    [key: string]: string;
}

interface CommandDescription {
    text: string;
    usage: string;
    example: string;
    flags: CommandFlags;
}

interface CommandOptions {
    nsfwOnly: boolean;
    triggers?: string[];
    ownerOnly?: boolean;
    ignoreNSFW?: Snowflake[];
    description: CommandDescription;
    botPerms?: BitFieldResolvable<PermissionString>;
    userPerms?: BitFieldResolvable<PermissionString>;
}

export abstract class Command {
    public triggers: string[];
    public ownerOnly: boolean;
    public nsfwOnly: boolean;
    public ignoreNSFW: Snowflake[];
    public description: CommandDescription;
    public botPerms?: BitFieldResolvable<PermissionString>;
    public userPerms?: BitFieldResolvable<PermissionString>;
    public constructor(data: CommandOptions) {
        this.triggers = data?.triggers || []
        this.ownerOnly = data.ownerOnly ?? false
        this.nsfwOnly = data.nsfwOnly ?? false
        this.ignoreNSFW = data.ignoreNSFW || []
        this.description = data.description
        this.botPerms = data.botPerms
        this.userPerms = data.userPerms
    }
    public abstract execute(message: Message, args: Args): Message | void | Promise<Message | void>
}