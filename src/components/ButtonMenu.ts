import { InteractionReplyOptions, MessageComponentInteraction } from "discord.js";
import { TweetsCollectorEndButtons } from "../constants";
import { iDeferUpdate, iEditReply } from "../utils/functions";
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
      await iDeferUpdate(i);
      switch (i.customId) {
        case "first-" + this.id:
          page = 0;
          await iEditReply(i, this.pages[0]);
          break;
        case "previous-" + this.id:
          page--;
          await iEditReply(i, this.pages[page]);
          break;
        case "next-" + this.id:
          page++;

          await iEditReply(i, this.pages[page]);
          break;
        case "last-" + this.id:
          page = this.pages.length - 1;
          await iEditReply(i, this.pages[page]);
          break;
      }
    });
    collector?.on("end", (collected) => {
      try {
        collected.first()?.editReply({
          components: [TweetsCollectorEndButtons],
        });
      } catch (e) {
        console.log("Error on button edit: ", e)
      }
    });
  }
}
