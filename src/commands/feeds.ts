import {
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageSelectOptionData
} from "discord.js";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Feeds extends Command {
  public constructor(client: Tweetcord) {
    super(client, {
      commandName: "feeds",
    });
  }
  public async reply(interaction: CommandInteraction): Promise<Message | void> {
    let guild = await this.bot.prisma.guild.findFirst({
      where: {
        id: interaction.guild?.id,
      },
      include: {
        feeds: {
          include: {
            user: true,
            webhook: true,
          },
        },
      },
    });
    const menu = new MessageActionRow().addComponents({
      type: "SELECT_MENU",
      disabled: true,
      placeholder: "No feeds",
      options: [
        {
          label: "Add feed first",
          value: "Add feed first",
        },
      ],
      customId: "menu",
    });
    if (!guild?.feeds || guild?.feeds?.length === 0) {
      return interaction.reply({
        embeds: [
          {
            author: {
              name: interaction.guild?.name,
              iconURL: interaction.guild?.iconURL({ dynamic: true })!,
              url: "https://tweetcord.xyz",
            },
            description: "Select feed below",
            footer: {
              text: interaction.user.tag,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            },
          },
        ],
        components: [menu],
      });
    } else {
      const options: MessageSelectOptionData[] = guild.feeds.map((f: any) => {
        return Object.assign(
          {},
          {
            label: f.user.screen_name,
            description: f.channel,
            value: f.user.id,
          }
        );
      });
      const menu = new MessageActionRow().addComponents({
        type: "SELECT_MENU",
        placeholder: "Click to see feeds",
        options,
      });
      return interaction.reply({
        embeds: [
          {
            author: {
              name: interaction.guild?.name,
              iconURL: interaction.guild?.iconURL({ dynamic: true })!,
              url: "https://tweetcord.xyz",
            },
            description: "Select feed below",
            footer: {
              text: interaction.user.tag,
              iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            },
          },
        ],
        components: [menu],
      });
    }
  }
}
