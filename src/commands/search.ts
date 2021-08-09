import { Collection, CommandInteraction, Formatters, Message, MessageActionRow, MessageSelectOptionData, SelectMenuInteraction, Util } from "discord.js";
import { FullUser, Status } from "twitter-d";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Search extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "search"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | any> {
        await interaction?.deferReply()
        if (interaction.options.getSubcommand() === "user") {
            const data: FullUser[] = await this.bot.twitter.get("users/search", {
                q: interaction.options.getString("username")
            })
            if (data.length === 0) return interaction.reply({ content: "No results found", ephemeral: true })
            const users = data.slice(0, data.length > 25 ? 25 : data.length)
            const options: MessageSelectOptionData[] = users.map((u, i) => {
                return Object.assign({}, {
                    label: u.screen_name,
                    description: u.description?.length === 0 ? "No description" : (u.description?.length! > 100 ? u.description?.substring(0, 99) + "\u2026" : u.description)!,
                    value: (++i).toString()
                })
            })
            const row = new MessageActionRow().addComponents({
                "type": "SELECT_MENU",
                "placeholder": `Click me! (${users.length} results)`,
                "customId": "users",
                options
            })
            await interaction.followUp({ content: "Select user below", components: [row], ephemeral: true })
            const filter = (i: SelectMenuInteraction) => i.user.id === interaction?.user.id
            const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60e3 })
            collector?.on("collect", (i: SelectMenuInteraction) => {
                if (i.customId === "users") {
                    i.deferUpdate()
                    this.user(i, users[Number(i.values[0]) - 1].screen_name)
                }
            })
            collector?.on("end", (collected) => {
                collected.first()?.editReply({
                    content: "⏰ Time's up", components: [
                        new MessageActionRow().addComponents(
                            {
                                type: "BUTTON",
                                style: "LINK",
                                url: "https://tweetcord.xyz",
                                label: "Visit our website!"
                            },
                            {
                                type: "BUTTON",
                                style: "LINK",
                                url: "https://discord.gg/ZWfpZuw4mn",
                                label: "Join support server!"
                            }
                        )
                    ]
                })
            })

        } else if (interaction.options.getSubcommand() === "tweet") {
            const data = await this.bot.twitter.get("search/tweets", {
                q: interaction.options.getString("text"),
                result_type: interaction.options.getString("result_type") ?? "mixed",
                lang: interaction.options.getString("language") ?? "en"
            })
            if (data.statuses.length === 0) return interaction.reply({ content: "No results found", ephemeral: true })
            const statuses: Status[] = data.statuses
            const tweets = statuses.slice(0, statuses.length > 25 ? 25 : statuses.length)
            const options: MessageSelectOptionData[] = tweets.map((u, i) => {
                return Object.assign({}, {
                    // @ts-ignore
                    label: `${u.text.startsWith("RT") ? "🔁" : ""} ${(u.user as FullUser).screen_name}`,
                    // @ts-ignore
                    description: u.text?.length === 0 ? "No description" : (u.text?.length! > 100 ? u.text?.substring(0, 99) + "\u2026" : u.text)!,
                    value: (++i).toString()
                })
            })
            const row = new MessageActionRow().addComponents({
                "type": "SELECT_MENU",
                "placeholder": `Click me! (${tweets.length} results)`,
                "customId": "tweets",
                options
            })
            await interaction.editReply({ content: "Select user below", components: [row] })

            const filter = (i: SelectMenuInteraction) => i.user.id === interaction?.user.id
            const collector = interaction.channel?.createMessageComponentCollector({ filter, time: 60e3 })

            collector?.on("collect", (i: SelectMenuInteraction) => {
                if (i.customId === "tweets") {
                    i.deferUpdate()
                    const tweet = tweets[Number(i.values[0]) - 1]
                    i.followUp({ content: `https://twitter.com/i/web/status/${tweet.id_str}`, ephemeral: true })
                }
            })
            collector?.on("end", (collected: Collection<string, SelectMenuInteraction>) => {
                collected.first()?.editReply({
                    content: "⏰ Time's up", components: [
                        new MessageActionRow().addComponents(
                            {
                                type: "BUTTON",
                                style: "LINK",
                                url: "https://tweetcord.xyz",
                                label: "Visit our website!"
                            },
                            {
                                type: "BUTTON",
                                style: "LINK",
                                url: "https://discord.gg/ZWfpZuw4mn",
                                label: "Join support server!"
                            }
                        )
                    ]
                })
            })

        }
    }
    private async user(i: SelectMenuInteraction, username: string) {
        let data = await this.bot.twitter.get("users/lookup", {
            screen_name: username
        })
        const user: FullUser = data[0];
        const embed = {
            title: `${Util.escapeMarkdown(user.name)} ${user.verified ? "<:verified:743873088185172108>" : ""}`,
            author: {
                name: user.screen_name,
                url: `https://twitter.com/${user.screen_name}`,
                iconURL: user.profile_image_url_https.replace("_normal", "")
            },
            thumbnail: {
                url: user.profile_image_url_https?.replace("_normal", "")
            },
            image: {
                url: user.profile_banner_url?.replace("_normal", "")
            },
            footer: {
                text: `Twitter ID is ${user.id}`,
                iconURL: i.user.displayAvatarURL()
            },
            fields: [
                {
                    name: "Followers",
                    value: user.followers_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Following",
                    value: user.friends_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Tweets",
                    value: user.statuses_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Favourites",
                    value: user.favourites_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Lists",
                    value: user.listed_count.toLocaleString(),
                    inline: true
                },
                {
                    name: "Protected",
                    value: user.protected ? "Yes" : "No",
                    inline: true
                },
                {
                    name: "Verified",
                    value: user.verified ? "Yes" : "No",
                    inline: true
                },
                {
                    name: "Account creation date",
                    value: Formatters.time(Date.parse(user.created_at) / 1000, "R"),
                    inline: true
                }
            ]
        }
        if (user.description) Object.assign(embed, {
            description: `>>> ${user.description}`,
        })
        if (user.location) embed.fields.push({
            name: "Location",
            value: user.location,
            inline: true
        })
        i.followUp({ embeds: [embed], ephemeral: true });
    }
}