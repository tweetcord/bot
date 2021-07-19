import { CommandInteraction, MessageActionRow, MessageSelectOptionData } from "discord.js";
import { FullUser, User } from "twitter-d";
import Tweetcord from "../components/Client";
import Command from "../components/Command";

export default class Search extends Command {
    public constructor(client: Tweetcord) {
        super(client, {
            commandName: "search"
        })
    }
    public async reply(interaction: CommandInteraction): Promise<void> {
        await interaction.defer()
        if (interaction.options.get("user")) {
            const data: FullUser[] = await this.bot.twitter.get("users/search", {
                q: interaction.options.get("user")?.options?.get("username")?.value
            })
            const order = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "nineth", "tenth"]
            const users: MessageSelectOptionData[] = data.slice(0, 10).map((u, i) => {
                return Object.create({
                    "label": u.screen_name,
                    "description": u.description ?? "No description",
                    "value": order[++i]
                })
            })
            console.log(users)
            const row = new MessageActionRow().addComponents(
                {
                    type: "SELECT_MENU",
                    customId: "users",
                    options: users
                }
            )
            interaction.editReply({ components: [row] })
        }
    }
}