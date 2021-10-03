import { Client, Webhook, TextChannel, Interaction } from "discord.js"

export const createWebhook = async (interaction: Interaction, channel: TextChannel): Promise<Webhook> => {
    let webhook = await channel?.createWebhook("Tweetcord Notification")
    
    await interaction.client.prisma.webhook.create({data: { 
        webhookId: webhook.id,
        webhookToken: webhook.token as string,
        guildId: interaction.guild?.id,
        channelId: channel.id
    }})

    return webhook
}

export const getGuildData = async (interaction: Interaction): Promise<any> => {
    return await interaction.client.prisma.guild.findFirst({
        where: {
            id: interaction.guild?.id,
        },
        include: {
            feeds: true,
            webhooks: true
        },
    });
}

export const getWebhookData = async (client: Client, channelId: string): Promise<any> => {    
    return await client.prisma.webhook.findFirst({
        where: {
            channelId: channelId,
        }
    });
}

export const removeFeed = async (interaction: Interaction, userID: string): Promise<any> => {
    return await interaction.client.prisma.feed.deleteMany({
        where: {
            twitterUserId: userID,
        },
    });
}

export const formatString = (str: string, obj: Object) : string => {
    let temp = str.replace(/{\s*(\w+)\s*}/g, (_match, p1) => {
        return obj[p1];
    });
    temp = temp.replace(/{%\s*(\w+)\s*%}/g, '{{ $1 }}');
    return temp;
}