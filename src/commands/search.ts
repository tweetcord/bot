import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from "discord.js";
import { FullUser, User } from "twitter-d";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Search extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "search"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<Message | any> {
        await interaction.defer()
        if (interaction.options.get("username")) {
            try {
                const data: FullUser[] = await this.bot.twitter.get("users/search", {
                    q: interaction.options.get("username")?.value
                })
                if (data.length === 0) return interaction.editReply({ content: "No results found" })
                const order = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth", "tenth"]
                const options: MessageSelectOptionData[] = data.slice(0, 10).map((u, i) => {
                    return Object.assign({}, {
                        label: u.screen_name,
                        description: u.description?.length === 0 ? "No description" : (u.description?.length! > 50 ? u.description?.substring(0, 49) + "\u2026" : u.description)!,
                        value: order[++i - 1]
                    })
                })
                const row = new MessageActionRow().addComponents({
                    "type": "SELECT_MENU",
                    "placeholder": "Click me!",
                    "customId": "users",
                    options
                })
                await interaction.editReply({ content: "Select user below", components: [row] })
            } catch (err) {
                console.error(err)
            }

        }
    }
}