import { Client, Message, PermissionResolvable } from "discord.js";
import Tweetcord from "./Client";
import { CommandOptions } from "./Types";

class Command {
    bot: Tweetcord;
    triggers: string[];
    nsfwOnly: Boolean;
    ownerOnly: Boolean;
    supportServerOnly: Boolean;
    help: any;
    userPermissions: Array<PermissionResolvable>;
    botPermissions: Array<PermissionResolvable>

    constructor(client: Tweetcord, options: CommandOptions) {
        this.bot = client
        this.triggers = options.triggers;
        this.nsfwOnly = options.nsfwOnly;
        this.ownerOnly = options.ownerOnly
        this.help = options.help;
        this.supportServerOnly = options.supportServerOnly;
        this.userPermissions = options.userPermissions;
        this.botPermissions = options.botPermissions;
    };

    async run(message: Message, args: string[]): Promise<Message | Message[]> {
        return message.channel.send('This command isn\'t available yet lol');
    }
};

export default Command;