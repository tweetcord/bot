import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, InteractionReplyOptions, Message } from "discord.js";
import { TypeOrArrayOf } from "twitter-api-v2/dist/types/shared.types";
import ButtonMenu from "../components/ButtonMenu";
import Command from "../components/Command";
import { emojis } from "../constants";
import { checkNSFW, getButtons, iDefer, iFollowUp, iReply } from "../utils/functions";

export default class Trend extends Command {
  public data() {
    return new SlashCommandBuilder()
      .setName("tweets")
      .setDescription("List of tweets of specified user")
      .addStringOption((option) => option.setName("username").setDescription("Username to find").setRequired(true))
      .addBooleanOption((option) => option.setName("hide_replies").setDescription("Whether or not hide replies"))
      .addBooleanOption((option) => option.setName("hide_retweets").setDescription("Whether or not hide retweets"));
  }

  public async run(interaction: CommandInteraction): Promise<Message | void> {
    !interaction.deferred && (await iDefer(interaction));
    if (!checkNSFW(interaction)) return;
    let username = interaction.options.getString("username", true);
    if (username.length >= 15 && username.includes(" ")) {
      iFollowUp(interaction, { content: emojis.f + "The length of the username can't exceed 15 characters or include any spaces." });
      return;
    }
    try {
      let { data: user } = await interaction.client.twitter.v2.userByUsername(username);
      if (!user) {
        iFollowUp(interaction, { content: emojis.f + "Can't find any users with named **" + username + "**" });
        return;
      }
      const exclude: TypeOrArrayOf<"replies" | "retweets"> | undefined = [];
      if (interaction.options.getBoolean("hide_replies")) exclude.push("replies");
      if (interaction.options.getBoolean("hide_retweets")) exclude.push("retweets");
      const data = await interaction.client.twitter.v2.userTimeline(user.id, { exclude });
      if (data?.tweets?.length === 0) return iReply(interaction, { content: "No tweets found", ephemeral: true });
      const answers: InteractionReplyOptions[] = [];
      const tweets = data?.tweets.slice(0, data?.tweets.length > 10 ? 10 : data.tweets.length);
      let id = Date.now().toString();
      let [TweetsFirstRow, TweetsRow, TweetsLastRow] = getButtons(id);
      for (let i = 0; i < tweets?.length; i++) {
        const url = `https://twitter.com/i/web/status/${tweets.at(i)?.id}`;
        answers?.push({
          content: `**(${i + 1}/${tweets.length})** ${url}`,
          components: answers.length === 0 ? [TweetsFirstRow] : tweets.length === i + 1 ? [TweetsLastRow] : [TweetsRow],
        });
      }
      await iFollowUp(interaction, {
        content: `**(1/${tweets.length})** https://twitter.com/i/web/status/${tweets.at(0)?.id}`,
        components: [TweetsFirstRow],
      });

      const menu = new ButtonMenu(answers, id);
      return menu.start({ interaction });
    } catch (e) {
      await iFollowUp(interaction, { content: emojis.f + "Can't find any users with named **" + username + "**" });
    }
  }
}
