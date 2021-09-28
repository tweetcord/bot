import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbedOptions } from "discord.js";
import Command from "../components/Command";

const ShardStatus = {
    0: "Ready",
    1: "Connecting",
    2: "Reconnecting",
    3: "Idle",
    4: "Nearly",
    5: "Disconnected",
    6: "Waiting for guilds",
    7: "Identifying",
    8: "Resuming"
}

export default class Shards extends Command {
    public data() {
        return new SlashCommandBuilder()
            .setName("shards")
            .setDescription("List and status of shards")
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction?.deferReply()
        const embed: MessageEmbedOptions = {
            title: "Shards",
            footer: {
                text: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            }
        }
        interaction.client.ws.shards.forEach(shard => {
            embed.fields?.push({
                name: `Shard ${shard.id}`,
                value: `
                Guilds: ${interaction.client.guilds.cache.filter(a => a.shardId === shard.id).size.toLocaleString()}
                Status: ${ShardStatus[shard.status]}
                `,
                inline: true
            });
        })

        return interaction.followUp({ embeds: [embed] })
    }
}