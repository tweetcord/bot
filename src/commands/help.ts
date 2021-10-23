import { SlashCommandBuilder, hyperlink, blockQuote } from '@discordjs/builders';
import { CommandInteraction, MessageEmbedOptions } from 'discord.js';
import Command from '../components/Command';

export default class Help extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName('help')
            .setDescription('Get help about Tweetcord.')
            .addStringOption((option) => option.setName('command').setDescription('Command name to get help').setRequired(false));
    }
    public async run(interaction: CommandInteraction): Promise<void> {
        let cmds = interaction.client.commands.map((command) => command.data().toJSON());
        let commandName = interaction.options.getString('command');
        let embed: MessageEmbedOptions = {};
        if (commandName && cmds.find((cmd) => cmd.name === commandName)) {
            let cmd = cmds.find((c) => c.name === commandName);
            let options = cmd.options;
            console.log(options);

            embed = {
                author: {
                    name: commandName,
                },
                description: `${cmd.description}`,
                footer: {
                    iconURL: interaction.user.displayAvatarURL(),
                    text: "Do not put [] around command arguments."
                },
                timestamp: new Date()
            };
            if (options.length > 0) {
                let map = options.map((opt: any) => `\`${opt.name}\``);
                embed.fields = [{ name: '**Arguments**', value: map.length > 0 ? map.join(', ') : map.join(' ') }];
            }
        } else {
            embed = {
                author: {
                    name: 'Tweetcord',
                },
                description: `If you need help about command, just use \`help [command]\` or join ${hyperlink(
                    'support server.',
                    'https://discord.com/invite/tV22Kvj'
                )}. \n\n **Commands:** ${blockQuote(cmds.map((command) => `\`${command.name}\``).join(', '))} \n `,
                footer: {
                    iconURL: interaction.user.displayAvatarURL(),
                    text: "Do not put [] around command arguments."
                },
                timestamp: new Date()
            };
        }

        return interaction.reply({
            embeds: [embed],
            ephemeral: commandName ? true : false,
        });
    }
}
