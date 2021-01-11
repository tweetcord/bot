import { Client, Message, PermissionResolvable } from "discord.js";
import { CommandOptions } from "./Types";
class Command {
    bot: Client;
    triggers: string[];
    nsfwOnly: Boolean;
    ownerOnly: Boolean;
    supportServerOnly: Boolean;
    help: any;
    userPermissions: PermissionResolvable;
    botPermissions: PermissionResolvable;

    constructor(client: Client, options: CommandOptions) {
        this.bot = client
        this.triggers = options.triggers;
        this.nsfwOnly = options.nsfwOnly;
        this.ownerOnly = options.ownerOnly
        this.help = options.help;
        this.supportServerOnly = options.supportServerOnly;
        this.userPermissions = options.userPermissions;
        this.botPermissions = options.botPermissions;
    };

    async run(message: Message, args: string[]) {
        return message.channel.send('This command isn\'t available yet lol');
    }
};

export default Command;