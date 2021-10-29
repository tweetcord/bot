import { InteractionReplyOptions, MessageComponentInteraction } from "discord.js";
import { TweetsCollectorEndButtons } from "../constants";
import { MenuOptions } from "./Types";

export default class ButtonMenu {
    pages: InteractionReplyOptions[];
    id: string;
    constructor(pages: InteractionReplyOptions[], id: string) {
        this.id = id;
        this.pages = pages;
    }

    public start(options: MenuOptions) {
        const filter = (i: MessageComponentInteraction) => i.user.id === options.interaction?.user.id;
        const collector = options.interaction.channel?.createMessageComponentCollector({
            filter,
            time: 3e5, // 5 minute
        });
        let page = 0;
        collector?.on("collect", async (i: MessageComponentInteraction) => {
            if (!i.customId.includes(this.id)) return;
            await i.deferUpdate();
            switch (i.customId) {
                case "first-" + this.id:
                    page = 0;
                    await i.editReply(this.pages[0]);

                    break;
                case "previous-" + this.id:
                    page--;
                    await i.editReply(this.pages[page]);
                    break;
                case "next-" + this.id:
                    page++;

                    await i.editReply(this.pages[page]);
                    break;
                case "last-" + this.id:
                    page = this.pages.length - 1;
                    await i.editReply(this.pages[page]);
                    break;
            }
        });
        collector?.on("end", (collected) => {
            collected.first()?.editReply({
                components: [TweetsCollectorEndButtons],
            });
        });
    }
}
