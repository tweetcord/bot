import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Permissions, TextChannel, MessageEmbedOptions } from "discord.js";
import { getGuildData, createWebhook, getWebhookData, removeFeed, deleteWebhook } from "../utils/functions";
import Command from "../components/Command";
import { emojis } from "../constants";
export default class Feeds extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("feed")
            .setDescription("Create, delete and edit feeds")
            .addSubcommand((command) =>
                command
                    .setName("add")
                    .setDescription("Adds a feed")
                    .addStringOption((option) => option.setName("username").setDescription("Username to add").setRequired(true))
                    .addChannelOption((option) => option.setName("channel").setDescription("Channel to add").setRequired(true))
                    .addStringOption((option) => option.setName("message").setDescription("A message that will be sent by bot when there is new tweet"))
            )
            .addSubcommand((command) =>
                command
                    .setName("remove")
                    .setDescription("Removes a feed")
                    .addStringOption((option) => option.setName("username").setDescription("Username to remove").setRequired(true))
                    .addChannelOption((option) => option.setName("channel").setDescription("Channel to remove").setRequired(true))
            )
            .addSubcommand((command) => command.setName("list").setDescription("Lists feeds"));
    }
    // Change Promise<any> please
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        if ((interaction.member?.permissions as Permissions).has(Permissions.FLAGS.MANAGE_GUILD)) {
            let guild = await getGuildData(interaction);

            if (!guild) {
                await interaction.client.prisma.guild.create({
                    data: {
                        id: interaction.guild?.id as string,
                    },
                });
                guild = await getGuildData(interaction);
            }

            const subcommand = interaction.options.getSubcommand(true);
            if (subcommand === "add") {
                if (guild.feeds.length === 30)
                    return await interaction.followUp({
                        content: emojis.f + "You've reached the 30 feed limit",
                    });
                let username = interaction.options.getString("username", true);
                let channel = interaction.options.getChannel("channel", true);
                if (channel.type != "GUILD_TEXT")
                    return interaction.followUp({
                        content: emojis.f + "Channel must be a text channel.",
                        ephemeral: true,
                    });
                let message = interaction.options.getString("message");
                if (!message) message = "";
                if (message.length > 100) {
                    return interaction.followUp({
                        content: emojis.f + "Message length cannot exceed 100 characters.",
                        ephemeral: true,
                    });
                }
                try {
                    let { data: user } = await interaction.client.twitter.v2.userByUsername(username);
                    let guildId = interaction.guild?.id;
                    if (guild.feeds.find((feed: any) => feed.channel === channel.id && feed.twitterUserId === user.id)) {
                        return interaction.followUp({
                            content: emojis.f + `${username}’s feed you are trying to add at <#${channel.id}> is currently at feed list`,
                            ephemeral: true,
                        });
                    }

                    let perms =
                        !interaction.guild?.members.cache.get(interaction.client.user?.id as string)?.permissions.has("MANAGE_WEBHOOKS") || channel.permissionOverwrites.cache.get(interaction.client.user?.id as string)?.deny.has("MANAGE_WEBHOOKS");
                    if (perms) {
                        await interaction.followUp({
                            content: emojis.f + "Tweetcord doen't have permissions to create webhooks. Grant permissions to continue.",
                            ephemeral: true,
                        });
                        return;
                    }

                    await interaction.client.prisma.feed.create({
                        data: {
                            channel: channel.id,
                            guildId,
                            twitterUserId: user.id,
                            message: message,
                        },
                    });
                    !(await getWebhookData(interaction.client, channel.id)) && (await createWebhook(interaction.client, channel as TextChannel, guildId as string));
                    await interaction.followUp({
                        content: emojis.t + "Added **" + user.name + "** to feed list",
                    });
                } catch (e) {
                    return interaction.followUp({
                        content: emojis.f + "Can't find any user with named **" + username + "**",
                        ephemeral: true,
                    });
                }
                //@ts-ignore
                interaction.client.streamClient.restart();
            } else if (subcommand === "remove") {
                let username = interaction.options.getString("username", true);
                let channel = interaction.options.getChannel("channel", true);
                if (channel.type != "GUILD_TEXT")
                    return interaction.followUp({
                        content: emojis.f + "Channel must be a text channel.",
                        ephemeral: true,
                    });
                try {
                    let { data } = await interaction.client.twitter.v2.userByUsername(username);
                    let find = guild.feeds.find((user: any) => data.id === user.twitterUserId && user.channel === channel.id);
                    if (!find) {
                        return interaction.followUp({
                            content: emojis.f + "There is no feeds for this username.",
                            ephemeral: true,
                        });
                    }
                    await removeFeed(interaction.client, find.id);
                    let webhook = guild.webhooks.find((webhook: any) => webhook.channelId === channel.id);

                    if (guild.feeds.filter((feed: any) => feed.channel === channel.id).length - 1 === 0) deleteWebhook(interaction.client, guild.id, channel.id, webhook.id, webhook.channelId, webhook.guildId);
                    //@ts-ignore
                    interaction.client.streamClient.restart();

                    return interaction.followUp({
                        content: emojis.t + "Removed **" + data.username + "** from feed list.",
                    });
                } catch (e) {
                    return interaction.followUp({
                        content: emojis.f + "Can't find any user with named **" + username + "**",
                        ephemeral: true,
                    });
                }
            } else if (subcommand === "list") {
                let { feeds }: any = guild;

                if (feeds.length === 0)
                    return interaction.followUp({
                        content: emojis.f + "There is nothing in the feed list",
                    });

                let channels: any = [];
                await feeds.forEach((feed: any) => {
                    if (!channels.find((channel: any) => channel.name === feed.channel)) {
                        channels.push({ name: feed.channel, value: [feed.twitterUserId] });
                    } else {
                        let find = channels.find((channel: any) => channel.name === feed.channel);
                        find.value.push(feed.twitterUserId);
                    }
                });
                console.log("0");

                let promise = new Promise<any>(async (resolve) => {
                    let index = 0;
                    console.log("1");

                    for (let channel of channels) {
                        channel.name = interaction.guild?.channels.cache.get(channel.name)?.name;
                        const { data } = await interaction.client.twitter.v2.users(channel.value);
                        channel.value = data.map((a) => "`" + a.username + "`").join("\n");
                        if (index === channels.length - 1) resolve("End");
                        index++;
                    }
                    console.log("2");
                });
                promise.then(async () => {
                    let embed: MessageEmbedOptions = {
                        author: {
                            name: interaction.client.user?.tag,
                            iconURL: interaction.client.user?.displayAvatarURL(),
                        },
                        fields: [...channels],
                    };
                    await interaction.followUp({ embeds: [embed] });
                });
            }
        } else {
            return interaction.followUp({
                content: emojis.f + "You don't have required permission",
                ephemeral: true,
            });
        }
    }
}
