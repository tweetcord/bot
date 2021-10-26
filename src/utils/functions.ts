import { Client, TextChannel, Interaction, MessageEmbedOptions, CommandInteraction, MessageActionRow } from "discord.js";
import { hyperlink } from "@discordjs/builders";
import Axios from "axios";

export const createWebhook = async (client: Client, channel: TextChannel, guildId: string): Promise<any> => {
    let webhook = await channel?.createWebhook("Tweetcord Notification");

    let webhookDb = await client.prisma.webhook.create({
        data: {
            webhookId: webhook.id,
            webhookToken: webhook.token as string,
            guildId: guildId,
            channelId: channel.id,
        },
    });

    return webhookDb;
};

export const getGuildData = async (interaction: Interaction): Promise<any> => {
    return await interaction.client.prisma.guild.findFirst({
        where: {
            id: interaction.guild?.id,
        },
        include: {
            feeds: true,
            webhooks: true,
        },
    });
};

export const getWebhookData = async (client: Client, channelId: string): Promise<any> => {
    let webhook = await client.prisma.webhook.findFirst({
        where: {
            channelId: channelId,
        },
    });
    return webhook;
};
//@ts-ignore
export const deleteWebhook = async (client: Client, id: string, webhookId: string, webhookToken: string, channelId, guildId): Promise<any> => {
    await Axios.delete(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`).catch((e) => e);
};
export const reCreateWebhook = async (client: Client, webhook: any, webhookOptions: Object): Promise<any> => {
    await client.prisma.webhook.delete({
        where: {
            id: webhook.id,
        },
    });
    let channel = client.channels.cache.get(webhook.channelId);
    let newWebhook = await createWebhook(client, channel as TextChannel, webhook.guildId);
    sendWebhookMessage(client, newWebhook, webhookOptions);
};

export const removeFeed = async (client: Client, id: string): Promise<any> => {
    return await client.prisma.feed.deleteMany({
        where: {
            id,
        },
    });
};

export const removeFeedByChannel = async (client: Client, channelID: string, guildId: string): Promise<any> => {
    return await client.prisma.feed.deleteMany({
        where: {
            channel: channelID,
            guildId: guildId,
        },
    });
};

export const removeGuildData = async (client: Client, guildId: string, db?: any): Promise<any> => {
    await client.prisma.feed.deleteMany({
        where: {
            guildId: guildId,
        },
    });
    await client.prisma.webhook.deleteMany({
        where: {
            guildId: guildId,
        },
    });
    if (db && db.webhooks.length > 0) {
        for (let webhook of db.webhooks) {
            await Axios.delete(`https://discord.com/api/webhooks/${webhook.webhookId}/${webhook.webhookToken}`);
        }
    }
    await client.prisma.guild.deleteMany({
        where: {
            id: guildId,
        },
    });
};

export const formatString = (str: string, obj: Object): string => {
    let temp = str.replace(/{\s*(\w+)\s*}/g, (_match, p1) => {
        return obj[p1];
    });
    temp = temp.replace(/{%\s*(\w+)\s*%}/g, "{{ $1 }}");
    return temp;
};

export const sendWebhookMessage = (client: Client, webhook: any, webhookOptions: Object) => {
    console.log("Sent Tweet Notification: " + webhook.channelId)
    Axios.post(`https://discord.com/api/webhooks/${webhook.webhookId}/${webhook.webhookToken}`, webhookOptions, {
        headers: { "Content-Type": "application/json" },
    }).catch(async (e) => {
        if (e.response && e.response.data.message === "Unknown Webhook") {
            await reCreateWebhook(client, webhook, webhookOptions);
        }
        console.log(e.response)
    });
};

export const formatTweets = async (text: string): Promise<string> => {
    return text
        .split(" ")
        .map((word: string) => {
            if (word.startsWith("@")) return (word = hyperlink(word, "https://twitter.com/" + word.substring(1)));
            if (word.startsWith("#")) return (word = hyperlink(word, "https://twitter.com/search?q=%23" + word.substring(1)));
            if (word.startsWith("https://t.co")) return (word = "");
            return word;
        })
        .join(" ");
};

export const checkNSFW = (interaction: CommandInteraction): boolean => {
    if (["693445343332794408", "300573341591535617", "534099893979971584", "548547460276944906"].includes(interaction.user.id)) return true;
    let channel = interaction.channel as TextChannel;
    let embed: MessageEmbedOptions = {
        description: "You have to use this command in NSFW marked channels.",
        image: {
            url: "https://cdn.discordapp.com/attachments/70868118746ß7591742/714053896212971571/NSFW.gif",
        },
    };
    interaction.followUp({ embeds: [embed] });
    return channel.nsfw;
};

export const getButtons = (id: string): Array<MessageActionRow> => {
    return [
        new MessageActionRow().addComponents(
            {
                customId: "first-" + id,
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true,
            },
            {
                customId: "previous-" + id,
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true,
            },
            {
                customId: "next-" + id,
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "last-" + id,
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON",
            }
        ),
        new MessageActionRow().addComponents(
            {
                customId: "first-" + id,
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "previous-" + id,
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "next-" + id,
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "last-" + id,
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON",
            }
        ),
        new MessageActionRow().addComponents(
            {
                customId: "first-" + id,
                emoji: "860524771832496138",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "previous-" + id,
                emoji: "860524798181900308",
                style: "PRIMARY",
                type: "BUTTON",
            },
            {
                customId: "next-" + id,
                emoji: "860524837675073556",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true,
            },
            {
                customId: "last-" + id,
                emoji: "860524885230223370",
                style: "PRIMARY",
                type: "BUTTON",
                disabled: true,
            }
        ),
    ];
};
