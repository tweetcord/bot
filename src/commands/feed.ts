import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Permissions, TextChannel, MessageEmbedOptions } from "discord.js";
import { getGuildData, createWebhook, getWebhookData } from "../utils/functions";
import Command from "../components/Command";

export default class Feeds extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("feed")
            .setDescription("Create, delete and edit feeds")
            .addSubcommand(command =>
                command
                    .setName("add")
                    .setDescription("Adds a feed")
                    .addStringOption(option =>
                        option
                            .setName("username")
                            .setDescription("Username to add")
                            .setRequired(true)
                    )
                    .addChannelOption(option =>
                        option
                            .setName("channel")
                            .setDescription("Channel to add")
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName("message")
                            .setDescription("A message that will be sent by bot when there is new tweet")
                    )
            )
            .addSubcommand(command =>
                command
                    .setName("remove")
                    .setDescription("Removes a feed")
                    .addStringOption(option =>
                        option
                            .setName("username")
                            .setDescription("Username to remove")
                            .setRequired(true)
                    )
            )
            .addSubcommand(command =>
                command
                    .setName("list")
                    .setDescription("Lists feeds")
            )
    }
    // Change Promise<any> please
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply({ ephemeral: true })
        if ((interaction.member?.permissions as Permissions).has(Permissions.FLAGS.MANAGE_GUILD)) {
            let guild = await getGuildData(interaction)
            
            if(!guild){            
                await interaction.client.prisma.guild.create({data: { 
                    id: interaction.guild?.id as string,
                }})
                guild = await getGuildData(interaction)
            }
            
            const subcommand = interaction.options.getSubcommand(true)
            if (subcommand === "add") {
                let channel = interaction.options.getChannel("channel", true) as TextChannel;
                let username = interaction.options.getString("username", true);
                let {data: user} = await interaction.client.twitter.v2.userByUsername(username)
                let guildId = interaction.guild?.id;
                await interaction.client.prisma.feed.create({
                    data: {
                        channel: channel.id,
                        guildId,
                        twitterUserId: user.id
                    }
                })
                !(await getWebhookData(interaction, channel.id)) && await createWebhook(interaction, channel)
                await interaction.followUp({content: user.name + ' added to feed list'})
            } else if (subcommand === "remove") {

            } else if (subcommand === "list") {
                let {feeds}: any = guild
                let channels: any = [];
                await feeds.forEach((feed: any) => {
                    if(!channels.find((channel: any) => channel.name === feed.channel)){
                        channels.push({name: feed.channel, value: [feed.twitterUserId]})
                    } else {
                        let find = channels.find((channel: any) => channel.name === feed.channel)
                        find.value.push(feed.twitterUserId)
                    }
                })
                let promise = new Promise<any>((resolve) =>{
                    channels.forEach(async (channel:any, index:number) => {
                        channel.name = interaction.guild?.channels.cache.get(channel.name)?.name
                        const { data } = await interaction.client.twitter.v2.users(channel.value);
                        channel.value = data.map(a => a.username).join("\n");
                        if (index === channels.length - 1) resolve("End");
                    })
                })
                promise.then(async () => {
                    let embed: MessageEmbedOptions = {
                        author: {
                            name: interaction.client.user?.tag,
                            iconURL: interaction.client.user?.displayAvatarURL()
                        },
                        fields: [
                            ...channels
                        ]
                    } 
                    await interaction.followUp({embeds: [embed]})
                })                
            }
        } else {
            return interaction.followUp({
                content: "You don't have required permission",
                ephemeral: true
            })
        }
    }
}