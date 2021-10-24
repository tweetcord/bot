import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Formatters, Message, MessageActionRow, MessageEmbedOptions, Util } from "discord.js";
import Command from "../components/Command";
import { emojis } from "../constants";
import { checkNSFW } from "../utils/functions";

export default class User extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("user")
            .setDescription("Shows information about a Twitter user")
            .addStringOption((option) => option.setName("username").setDescription("Username to find").setRequired(true));
    }
    public async run(interaction: CommandInteraction, screen_name: string, isFromSearch?: boolean): Promise<Message | void> {
        !isFromSearch && (await interaction?.deferReply());
        if (!checkNSFW(interaction)) return;
        try {
            let user = await interaction.client.twitter.v1.user({ screen_name: screen_name ?? interaction.options.getString("username", true) });
            const embed: MessageEmbedOptions = {
                title: `${Util.escapeMarkdown(user.name)} ${user.verified ? Formatters.formatEmoji("743873088185172108") : ""}`,
                author: {
                    name: user.screen_name,
                    url: `https://twitter.com/i/user/${user.id}`,
                    iconURL: user.profile_image_url_https?.replace("_normal", ""),
                },
                description: Formatters.blockQuote(user.description || "No description"),
                thumbnail: {
                    url: user.profile_image_url_https?.replace("_normal", ""),
                },
                image: {
                    url: user.profile_banner_url?.replace("_normal", ""),
                },
                footer: {
                    text: `Twitter ID is ${user.id}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                },
                timestamp: Date.now(),
                fields: [
                    {
                        name: "Followers",
                        value: user.followers_count?.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: "Following",
                        value: user.friends_count.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: "Tweets",
                        value: user.statuses_count.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: "Lists",
                        value: user.listed_count?.toLocaleString(),
                        inline: true,
                    },
                    {
                        name: "Protected",
                        value: user.protected ? "Yes" : "No",
                        inline: true,
                    },
                    {
                        name: "Verified",
                        value: user.verified ? "Yes" : "No",
                        inline: true,
                    },
                    {
                        name: "Account creation date",
                        value: Formatters.time(Date.parse(user.created_at as string) / 1000, "R"),
                        inline: true,
                    },
                    {
                        name: "Location",
                        value: user.location || "Unknown",
                        inline: true,
                    },
                ],
            };
            const buttons = new MessageActionRow().addComponents({
                label: "View profile",
                type: "BUTTON",
                style: "LINK",
                url: `https://twitter.com/i/user/${user.id}`,
            });
            if (isFromSearch) {
                await interaction.editReply({ content: " ", embeds: [embed], components: [buttons] });
            } else {
                await interaction.followUp({ embeds: [embed], components: [buttons] });
            }
        } catch (e: any) {
            interaction.followUp({ content: emojis.f + "Can't find any user with named **" + interaction.options.getString("username", true) + "**", ephemeral: true });
        }
    }
}
