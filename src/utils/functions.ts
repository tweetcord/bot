import { Client, Webhook, TextChannel, Interaction, MessageEmbedOptions, CommandInteraction } from "discord.js";
import { hyperlink } from "@discordjs/builders";
import Axios from "axios";

export const createWebhook = async (interaction: Interaction, channel: TextChannel): Promise<Webhook> => {
    let webhook = await channel?.createWebhook("Tweetcord Notification");

    await interaction.client.prisma.webhook.create({
        data: {
            webhookId: webhook.id,
            webhookToken: webhook.token as string,
            guildId: interaction.guild?.id,
            channelId: channel.id,
        },
    });

    return webhook;
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
    return await client.prisma.webhook.findFirst({
        where: {
            channelId: channelId,
        },
    });
};
export const deleteWebhook = async (client: Client, channelId: string, guildId: string, webhookId: string, webhookToken: string): Promise<any> => {
    let del = await client.prisma.webhook.deleteMany({
        where: {
            webhookId: webhookId,
            webhookToken: webhookToken,
        },
    });
    await Axios.delete(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`).catch((e) => e);
    removeFeedByChannel(client, channelId, guildId);
    return del;
};

export const removeFeedById = async (client: Client, userID: string, guildId: string, channelId: string): Promise<any> => {
    return await client.prisma.feed.deleteMany({
        where: {
            twitterUserId: userID,
            guildId: guildId,
            channel: channelId,
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

export const sendWebhookMessage = (client: Client, webhookOptions: Object, webhookId: string, webhookToken: string, feed: any) => {
    Axios.post(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`, webhookOptions, {
        headers: { "Content-Type": "application/json" },
    }).catch(async (e) => {
        if (e.response.data.message === "Unknown Webhook") {
            await deleteWebhook(client, feed.channel, feed.guildId as string, webhookId, webhookToken);
        }
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
