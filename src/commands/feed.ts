import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbedOptions, Permissions, TextChannel } from "discord.js";
import { getGuildData, createWebhook, getWebhookData, removeFeed, deleteWebhook, updateFeed, resolveColor, iDefer, iFollowUp } from "../utils/functions";
import Command from "../components/Command";
import { emojis } from "../constants";
import { UserV2 } from "twitter-api-v2";
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
                    .addBooleanOption((option) => option.setName("replies").setDescription("Show replies when you get notification"))
                    .addBooleanOption((option) => option.setName("retweets").setDescription("Show retweets when you get notification"))
            )
            .addSubcommand((command) =>
                command
                    .setName("remove")
                    .setDescription("Removes a feed")
                    .addStringOption((option) => option.setName("username").setDescription("Username to remove").setRequired(true))
                    .addChannelOption((option) => option.setName("channel").setDescription("Channel to remove").setRequired(true))
            )
            .addSubcommand((command) => command.setName("list").setDescription("Lists feeds"))
            .addSubcommand((command) =>
                command
                    .setName("details")
                    .setDescription("Get details from a feed")
                    .addStringOption((option) => option.setName("username").setDescription("Feed's username to view details").setRequired(true))
                    .addChannelOption((option) => option.setName("channel").setDescription("Feed's Channel to view details").setRequired(true))
            )
            .addSubcommand((command) =>
                command
                    .setName("update")
                    .setDescription("Update a feed")
                    .addStringOption((option) => option.setName("feed_id").setDescription("Feeds id to edit").setRequired(true))
                    .addStringOption((option) => option.setName("message").setDescription("New message for the feed"))
                    .addBooleanOption((option) => option.setName("replies").setDescription("Show replies when you get notification"))
                    .addBooleanOption((option) => option.setName("retweets").setDescription("Show retweets when you get notification"))
            );
    }
    // Change Promise<any> please
    public async run(interaction: CommandInteraction): Promise<any> {
        await iDefer(interaction, { ephemeral: true });
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
            let showReplies = interaction.options.getBoolean("replies") ? interaction.options.getBoolean("replies") : false;
            let showRetweets = interaction.options.getBoolean("retweets") ? interaction.options.getBoolean("retweets") : false;

            if (subcommand === "add") {
                if (guild.feeds.length === 30)
                    return await iFollowUp(interaction, {
                        content: emojis.f + "You've reached the 30 feed limit",
                    });
                let username = interaction.options.getString("username", true);
                let channel = interaction.options.getChannel("channel", true);
                if (channel.type != "GUILD_TEXT")
                    return iFollowUp(interaction, {
                        content: emojis.f + "Channel must be a text channel.",
                        ephemeral: true,
                    });
                let message = interaction.options.getString("message");
                if (!message) message = "";
                if (message.length > 100) {
                    return iFollowUp(interaction, {
                        content: emojis.f + "Message length cannot exceed 100 characters.",
                        ephemeral: true,
                    });
                }
                let user: UserV2;
                try {
                    user = (await interaction.client.twitter.v2.userByUsername(username)).data;
                } catch (e) {
                    return iFollowUp(interaction, {
                        content: emojis.f + "Can't find any user with named **" + username + "**",
                        ephemeral: true,
                    });
                }
                try {
                    let guildId = interaction.guild?.id;
                    if (guild.feeds.find((feed: any) => feed.channel === channel.id && feed.twitterUserId === user.id)) {
                        return iFollowUp(interaction, {
                            content: emojis.f + `${username}’s feed you are trying to add at <#${channel.id}> is currently at feed list`,
                            ephemeral: true,
                        });
                    }
                    !(await getWebhookData(interaction.client, channel.id)) && (await createWebhook(interaction.client, channel as TextChannel, guildId as string));
                    await interaction.client.prisma.feed.create({
                        data: {
                            channel: channel.id,
                            guildId,
                            twitterUserId: user.id,
                            message: message,
                            replies: showReplies as boolean,
                            retweets: showRetweets as boolean,
                        },
                    });

                    await iFollowUp(interaction, {
                        content: emojis.t + "Added **" + user.name + "** to feed list",
                    });
                    //@ts-ignore
                    interaction.client.streamClient.restart();
                } catch (e: any) {
                    if (e.code === 50013) {
                        iFollowUp(interaction, { content: emojis.f + "Tweetcord doen't have permissions to create webhooks. Grant permissions to continue." });
                    } else {
                        iFollowUp(interaction, { content: emojis.f + "There is an error occurred. Please try again later." });
                    }
                }
            } else if (subcommand === "remove") {
                let username = interaction.options.getString("username", true);
                let channel = interaction.options.getChannel("channel", true);
                if (channel.type != "GUILD_TEXT")
                    return iFollowUp(interaction, {
                        content: emojis.f + "Channel must be a text channel.",
                        ephemeral: true,
                    });
                try {
                    let { data } = await interaction.client.twitter.v2.userByUsername(username);
                    let find = guild.feeds.find((user: any) => data.id === user.twitterUserId && user.channel === channel.id);
                    if (!find) {
                        return iFollowUp(interaction, {
                            content: emojis.f + "There is no feeds for this username.",
                            ephemeral: true,
                        });
                    }
                    await removeFeed(interaction.client, find.id);
                    let webhook = guild.webhooks.find((webhook: any) => webhook.channelId === channel.id);

                    if (guild.feeds.filter((feed: any) => feed.channel === channel.id).length - 1 === 0) deleteWebhook(interaction.client, webhook.id, webhook.webhookId, webhook.webhookToken);
                    //@ts-ignore
                    interaction.client.streamClient.restart();

                    return iFollowUp(interaction, {
                        content: emojis.t + "Removed **" + data.username + "** from feed list.",
                    });
                } catch (e) {
                    return iFollowUp(interaction, {
                        content: emojis.f + "Can't find any user with named **" + username + "**",
                        ephemeral: true,
                    });
                }
            } else if (subcommand === "list") {
                let { feeds }: any = guild;
                if (feeds.length === 0)
                    return iFollowUp(interaction, {
                        content: emojis.f + "There is nothing in the feed list",
                    });
                let ids: Array<string> = [];
                feeds.forEach((feed: any) => {
                    ids.push(feed.twitterUserId);
                });
                let idSet = new Set(ids);
                let idArr = Array.from(idSet);
                const { data } = await interaction.client.twitter.v2.users(idArr);
                let feedsUnique: any = [];

                for (let feed of feeds) {
                    let find = feedsUnique.find((f: any) => f.name === feed.channel);

                    if (find) {
                        find.value = [...find.value, data.find((user) => user.id === feed.twitterUserId)?.username];
                    } else {
                        feedsUnique.push({ name: feed.channel, value: [data.find((user) => user.id === feed.twitterUserId)?.username], inline: true });
                    }
                }

                feedsUnique.map((feed: any) => {
                    (feed.name = interaction.guild?.channels.cache.get(feed.name)?.name), (feed.value = feed.value.map((str: string) => "`" + str + "`").join("\n"));
                });

                if (feedsUnique.length > 15) {
                    let embed: Array<MessageEmbedOptions> = [];
                    for (let i = 0; i < 2; i++) {
                        let slice = feedsUnique.slice(i * 15, (i + 1) * 15);
                        if (i === 0) {
                            embed.push({
                                author: {
                                    name: interaction.client.user?.username,
                                    iconURL: interaction.client.user?.displayAvatarURL(),
                                },
                                fields: [...slice],
                            });
                        } else {
                            embed.push({
                                fields: [...slice],
                                footer: {
                                    text: "Total feed count: " + ids.length,
                                },
                            });
                        }
                    }
                    iFollowUp(interaction, { embeds: embed });
                } else {
                    let embed: MessageEmbedOptions = {
                        author: {
                            name: interaction.client.user?.username,
                            iconURL: interaction.client.user?.displayAvatarURL(),
                        },
                        fields: [...feedsUnique],
                        footer: {
                            text: "Total feed count: " + ids.length,
                        },
                        color: resolveColor("#1da0f6"),
                    };
                    iFollowUp(interaction, { embeds: [embed] });
                }
            } else if (subcommand === "details") {
                let { feeds } = guild;
                let username = interaction.options.getString("username", true);
                let channel = interaction.options.getChannel("channel", true);
                if (channel.type != "GUILD_TEXT")
                    return iFollowUp(interaction, {
                        content: emojis.f + "Channel must be a text channel.",
                        ephemeral: true,
                    });
                try {
                    let { data } = await interaction.client.twitter.v2.userByUsername(username);
                    let find = feeds.find((feed: any) => feed.channel === channel.id && feed.twitterUserId === data.id);
                    if (!find)
                        return iFollowUp(interaction, {
                            content: emojis.f + "There is no feeds for this username in " + channel.toString(),
                            ephemeral: true,
                        });
                    let embed: MessageEmbedOptions = {
                        author: {
                            name: interaction.client.user?.username,
                            iconURL: interaction.client.user?.displayAvatarURL(),
                        },
                        fields: [
                            {
                                name: data.username,
                                value: `Id: \`${find.id}\` \n  Channel: <#${find.channel}> \n Replies: \`${find.replies}\` \n Retweets: \`${find.retweets}\``,
                            },
                        ],
                    };
                    iFollowUp(interaction, { embeds: [embed] });
                } catch (e) {
                    iFollowUp(interaction, { content: emojis.f + "Can't find any users with named **" + username + "**" });
                }
            } else if (subcommand === "update") {
                let message = interaction.options.getString("message");
                let feedId = interaction.options.getString("feed_id", true);
                if (!message && showRetweets && showReplies) return iFollowUp(interaction, { content: emojis.f + "You have to provide at least 1 option." });
                let { feeds } = guild;
                let find = feeds.find((feed: any) => feed.id === feedId);
                if (!find) return iFollowUp(interaction, { content: emojis.f + "Can't find any feeds with this id (`" + feedId + "`)" });
                if (!message) message = find.message;
                if (message === "tweetcord_remove_message") message = "";
                if (message === find.message && showReplies === find.replies && showRetweets === find.retweets) return iFollowUp(interaction, { content: emojis.f + "Provided options same with current feed's options" });
                await updateFeed(interaction, feedId, message as string, showReplies as boolean, showRetweets as boolean);
                iFollowUp(interaction, { content: emojis.t + "Feed successfully updated" });
                //@ts-ignore
                interaction.client.streamClient.restart();
            }
        } else {
            return iFollowUp(interaction, {
                content: emojis.f + "You don't have required permission",
                ephemeral: true,
            });
        }
    }
}
