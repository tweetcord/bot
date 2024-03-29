import { MessageActionRow, MessageComponentInteraction, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { iDeferUpdate, iFollowUp } from "../utils/functions";
import { MenuOptions } from "./Types";

export default class SelectMenu {
    options: MessageSelectOptionData[];
    constructor(options: MessageSelectOptionData[]) {
        this.options = options;
    }
    public async start(options: MenuOptions) {
        let id = "users-" + Date.now();
        const row = new MessageActionRow().addComponents({
            type: "SELECT_MENU",
            placeholder: "Click me!",
            customId: id,
            options: this.options,
        });
        await iFollowUp(options.interaction, { content: "Select user below", components: [row], ephemeral: true });
        const filter = (i: MessageComponentInteraction) => i.user.id === options.interaction?.user.id;
        const collector = options.interaction.channel?.createMessageComponentCollector({
            filter,
            time: 3e5, // 5 minutes
        });
        collector?.on("collect", async (i: SelectMenuInteraction) => {
            if (i.customId === id) {
                await options.interaction.client.commands.get("user")?.run(options.interaction, options.data?.[Number(i.values[0]) - 1].screen_name, true);
                await iDeferUpdate(i);
            }
        });
    }
}
