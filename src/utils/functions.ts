import {Interaction, Webhook, TextChannel} from "discord.js"

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

export const getWebhookData = async (interaction: Interaction, channelId: string): Promise<any> => {    
    return await interaction.client.prisma.webhook.findFirst({
        where: {
            channelId: channelId,
        }
    });
}