import { CommandInteraction, MessageEmbedOptions } from "discord.js";
import Tweetcord from "../components/Client";
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

export default class Search extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "shards"
        })
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
        for (const shard of this.bot.ws.shards) {
            embed.fields?.push({
                name: `Shard ${shard[1].id}`,
                value: `
                Guilds: ${this.bot.guilds.cache.filter(a => a.shardId === shard[1].id).size.toLocaleString()}
                Status: ${ShardStatus[shard[1].status]}
                `,
                inline: true
            })
        }
        return interaction.followUp({ embeds: [embed] })
    }
}