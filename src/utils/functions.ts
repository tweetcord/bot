import { Client, Webhook, TextChannel, Interaction } from 'discord.js';
import { hyperlink } from '@discordjs/builders';
import Axios from 'axios';

export const createWebhook = async (interaction: Interaction, channel: TextChannel): Promise<Webhook> => {
    let webhook = await channel?.createWebhook('Tweetcord Notification');

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
    await Axios.delete(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`);
    removeFeedByChannel(client, channelId, guildId);
    return del;
};

export const removeFeedById = async (interaction: Interaction, userID: string, guildId: string, channelId: string): Promise<any> => {
    return await interaction.client.prisma.feed.deleteMany({
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

export const removeGuildData = async (client: Client, guildId: string): Promise<any> => {
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
    temp = temp.replace(/{%\s*(\w+)\s*%}/g, '{{ $1 }}');
    return temp;
};

export const sendWebhookMessage = (client: Client, webhookOptions: Object, webhookId: string, webhookToken: string, feed: any) => {
    Axios.post(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`, webhookOptions, {
        headers: { 'Content-Type': 'application/json' },
    }).catch(async (e) => {
        if (e.response.data.message === 'Unknown Webhook') {
            await deleteWebhook(client, feed.channel, feed.guildId as string, webhookId, webhookToken);
        }
        console.log(e.response.data);
    });
};

export const formatTweets = async (text: string): Promise<string> => {
    return text
        .split(' ')
        .map((word: string) => {
            if (word.startsWith('@')) return (word = hyperlink(word, 'https://twitter.com/' + word.substring(1)));
            if (word.startsWith('#')) return (word = hyperlink(word, 'https://twitter.com/search?q=%23' + word.substring(1)));
            if (word.startsWith('https://t.co')) return (word = '');
            return word;
        })
        .join(' ');
};
