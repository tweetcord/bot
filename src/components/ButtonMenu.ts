import { InteractionReplyOptions, MessageComponentInteraction } from "discord.js";
import { TweetsCollectorEndButtons } from "../constants";
import { MenuOptions } from "./Types";

export default class ButtonMenu {
    pages: InteractionReplyOptions[]
    constructor(pages: InteractionReplyOptions[]) {
        this.pages = pages;
    }

    public start(options: MenuOptions) {
        const filter = (i: MessageComponentInteraction) => i.user.id === options.interaction?.user.id;
        const collector = options.interaction.channel?.createMessageComponentCollector({
            filter,
            time: 3e5 // 5 minute
        });
        let page = 0;
        collector?.on("collect", async (i: MessageComponentInteraction) => {
            await i.deferUpdate();
            switch (i.customId) {
                case "first":
                    page = 0
                    await i.editReply(this.pages[0]);
                    break;
                case "previous":
                    page--
                    await i.editReply(this.pages[page]);
                    break;
                case "next":
                    page++
                    await i.editReply(this.pages[page]);
                    break;
                case "last":
                    page = this.pages.length - 1;
                    await i.editReply(this.pages[page]);
                    break;
            }
        })
        collector?.on("end", (collected) => {
            collected.first()?.editReply({
                components: [TweetsCollectorEndButtons]
            });
        });
    };
};