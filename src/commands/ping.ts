import { CommandOptionType, SlashCommand, SlashCreator } from 'slash-create';

export default class HelloCommand extends SlashCommand {
    public constructor(creator: SlashCreator) {
        super(creator, {
            name: 'ping',
            description: 'Bot\'s ping.',
            options: [{
                name: "test",
                description: "3131",
                type: CommandOptionType.STRING
            }]
        });
    }

    async run() {
        return "31"
    }
}