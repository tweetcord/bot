import { MessageActionRow, MessageComponentInteraction, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { MenuOptions } from "./Types";

export default class SelectMenu {
    options: MessageSelectOptionData[];
    constructor(options: MessageSelectOptionData[]) {
        this.options = options;
    }
    public async start(options: MenuOptions) {
        const row = new MessageActionRow().addComponents({
            type: "SELECT_MENU",
            placeholder: "Click me!",
            customId: "users",
            options: this.options,
        });
        await options.interaction.followUp({ content: "Select user below", components: [row], ephemeral: true });
        const filter = (i: MessageComponentInteraction) => i.user.id === options.interaction?.user.id;
        const collector = options.interaction.channel?.createMessageComponentCollector({
            filter,
            time: 3e5, // 5 minute
        });
        collector?.on("collect", (i: SelectMenuInteraction) => {
            if (i.customId === "users") {
                i.deferUpdate();
                options.interaction.client.commands.get("user")?.run(options.interaction, options.data?.[Number(i.values[0]) - 1].screen_name, true);
            }
        });
    }
}
