import { CommandInteraction, Message, MessageActionRow } from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Feed extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "feed"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | void> {
        let guild = await this.bot.prisma.guild.findFirst({
            where: {
                id: interaction.guild?.id
            },
            include: {
                feeds: true
            }
        })
        const row = new MessageActionRow().addComponents({
            style: "SUCCESS",
            type: "BUTTON",
            label: "Create feed",
            // emoji: "",
            customId: "create"
        },
         {
                type: "SELECT_MENU",
                disabled: true,
                placeholder: "No feeds",
                options: [{
                    label: "Add feed first",
                    value: "Add feed first"
                }],
                customId: "menu"
            })
        if (!guild?.feeds || guild?.feeds?.length === 0) {
            return interaction.reply({
                embeds: [{
                    title: interaction.guild?.name,
                    description: "Select feed below",
                    footer: {
                        text: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    }
                }],
                components: [row]
            })
        }
    }
}