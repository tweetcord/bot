import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Formatters, MessageEmbedOptions, Util } from "discord.js";
import Command from "../components/Command";
import { iFollowUp, iDefer, resolveColor, checkUserRateLimits, formatRateLimitsByPremium } from "../utils/functions";
import { TweetV1, TwitterApi, UserV2BlockResult, UserV2Result, UserV2UnfollowResult } from "twitter-api-v2";
import { emojis } from "../constants";
require("dotenv").config();

export default class Account extends Command {
  public data() {
    return new SlashCommandBuilder()
      .setName("account")
      .setDescription("Manage your account from Tweetcord.")
      .addSubcommand((command) => command.setName("info").setDescription("Get information about your account."))
      .addSubcommand((command) =>
        command
          .setName("tweet")
          .setDescription("Tweet from discord.")
          .addStringOption((option) => option.setName("text").setDescription("The text of the tweet.").setRequired(true))
      )
      .addSubcommand((command) =>
        command
          .setName("follow")
          .setDescription("Follow a user.")
          .addStringOption((option) => option.setName("username").setDescription("User's username to follow.").setRequired(true))
      )
      .addSubcommand((command) =>
        command
          .setName("unfollow")
          .setDescription("Unfollow a user.")
          .addStringOption((option) => option.setName("username").setDescription("User's username to unfollow.").setRequired(true))
      )
      .addSubcommand((command) =>
        command
          .setName("block")
          .setDescription("Block a user.")
          .addStringOption((option) => option.setName("username").setDescription("User's username to block.").setRequired(true))
      )
      .addSubcommand((command) =>
        command
          .setName("unblock")
          .setDescription("Unblock a user.")
          .addStringOption((option) => option.setName("username").setDescription("User's username to unblock.").setRequired(true))
      )
      .addSubcommand((command) => command.setName("ratelimits").setDescription("Get information about your current rate limits."));
  }
  public async run(interaction: CommandInteraction): Promise<void> {
    await iDefer(interaction, { ephemeral: true });
    let userDB = await interaction.client.prisma.user.findFirst({ where: { id: interaction.user.id } });
    if (!userDB || !userDB.accessToken)
      return iFollowUp(interaction, {
        content: emojis.f + "You haven't linked your account yet.",
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                style: "LINK",
                type: "BUTTON",
                url: `https://tweetcord.xyz/link`,
                label: "Link your account",
              },
            ],
          },
        ],
      });
    let twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_APPKEY as string,
      appSecret: process.env.TWITTER_APPSECRET as string,
      accessToken: userDB.accessToken,
      accessSecret: userDB.accessSecret,
    });
    let cureentTwitterUser = await twitterClient.currentUser();
    const subcommand = interaction.options.getSubcommand(true);
    if (checkUserRateLimits(interaction, userDB)) return iFollowUp(interaction, { content: emojis.f + "You are being rate limited. Please try again later." });
    if (subcommand === "info") {
      const embed: MessageEmbedOptions = {
        title: `${Util.escapeMarkdown(cureentTwitterUser.name)} ${cureentTwitterUser.verified ? Formatters.formatEmoji("743873088185172108") : ""}`,
        author: {
          name: cureentTwitterUser.screen_name,
          url: `https://twitter.com/i/user/${cureentTwitterUser.id}`,
          iconURL: cureentTwitterUser.profile_image_url_https?.replace("_normal", ""),
        },
        description: Formatters.blockQuote(cureentTwitterUser.description || "No description"),
        color: resolveColor("#1da0f6"),
        thumbnail: {
          url: cureentTwitterUser.profile_image_url_https?.replace("_normal", ""),
        },
        image: {
          url: cureentTwitterUser.profile_banner_url?.replace("_normal", ""),
        },
        footer: {
          text: `Twitter ID is ${cureentTwitterUser.id}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        },
        timestamp: Date.now(),
        fields: [
          {
            name: "Followers",
            value: cureentTwitterUser.followers_count?.toLocaleString(),
            inline: true,
          },
          {
            name: "Following",
            value: cureentTwitterUser.friends_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Tweets",
            value: cureentTwitterUser.statuses_count.toLocaleString(),
            inline: true,
          },
          {
            name: "Lists",
            value: cureentTwitterUser.listed_count?.toLocaleString(),
            inline: true,
          },
          {
            name: "Protected",
            value: cureentTwitterUser.protected ? "Yes" : "No",
            inline: true,
          },
          {
            name: "Verified",
            value: cureentTwitterUser.verified ? "Yes" : "No",
            inline: true,
          },
          {
            name: "Account creation date",
            value: Formatters.time(Date.parse(cureentTwitterUser.created_at as string) / 1000, "R"),
            inline: true,
          },
          {
            name: "Location",
            value: cureentTwitterUser.location || "Unknown",
            inline: true,
          },
        ],
      };
      iFollowUp(interaction, { embeds: [embed], ephemeral: true });
    } else if (subcommand === "tweet") {
      let text = interaction.options.getString("text", true);
      let tweet = (await twitterClient.v1.tweet(text).catch((e) => {
        console.log(e.data.errors[0].message);
      })) as TweetV1;
      iFollowUp(interaction, {
        content: emojis.t + `**Tweet sent!**`,
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                style: "LINK",
                type: "BUTTON",
                url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
                label: "Open on Twitter",
              },
            ],
          },
        ],
        ephemeral: false,
      });
    } else if (subcommand === "follow") {
      let username = interaction.options.getString("username", true);
      let user = (await twitterClient.v2.userByUsername(username).catch((e) => {
        console.log(e.data.errors[0].message);
      })) as UserV2Result;
      if (!user) return iFollowUp(interaction, { content: "User not found." });
      twitterClient.v2
        .follow(cureentTwitterUser.id_str, user.data.id)
        .catch((e) => {
          return iFollowUp(interaction, { content: e.data.errors[0].message, ephemeral: true });
        })
        .then(() => {
          return iFollowUp(interaction, { content: emojis.t + "Followed " + user.data.name + "." });
        });
    } else if (subcommand === "unfollow") {
      let username = interaction.options.getString("username", true);
      let user = (await twitterClient.v2.userByUsername(username).catch((e) => {
        console.log(e.data.errors[0].message);
      })) as UserV2Result;
      if (!user) return iFollowUp(interaction, { content: "User not found." });
      twitterClient.v2
        .unfollow(cureentTwitterUser.id_str, user.data.id)
        .catch((e) => {
          return iFollowUp(interaction, { content: e.data.errors[0].message, ephemeral: true });
        })
        .then((r) => {
          if (!(r as UserV2UnfollowResult).data.following) return iFollowUp(interaction, { content: emojis.t + "You already not following " + user.data.name + "." });
          return iFollowUp(interaction, { content: emojis.t + "Unfollowed " + user.data.username + "." });
        });
    } else if (subcommand === "block") {
      let username = interaction.options.getString("username", true);
      let user = (await twitterClient.v2.userByUsername(username).catch((e) => {
        console.log(e.data.errors[0].message);
      })) as UserV2Result;
      if (!user) return iFollowUp(interaction, { content: "User not found." });
      twitterClient.v2
        .block(cureentTwitterUser.id_str, user.data.id)
        .catch((e) => {
          return iFollowUp(interaction, { content: e.data.errors[0].message, ephemeral: true });
        })
        .then(() => {
          return iFollowUp(interaction, { content: emojis.t + "Blocked " + user.data.name + "." });
        });
    } else if (subcommand === "unblock") {
      let username = interaction.options.getString("username", true);
      let user = (await twitterClient.v2.userByUsername(username).catch((e) => {
        console.log(e.data.errors[0].message);
      })) as UserV2Result;
      if (!user) return iFollowUp(interaction, { content: "User not found." });
      twitterClient.v2
        .unblock(cureentTwitterUser.id_str, user.data.id)
        .catch((e) => {
          return iFollowUp(interaction, { content: e.data.errors[0].message, ephemeral: true });
        })
        .then((r) => {
          if (!(r as UserV2BlockResult).data.blocking) return iFollowUp(interaction, { content: emojis.t + "You already not blocked " + user.data.name + "." });
          return iFollowUp(interaction, { content: emojis.t + "Unblocked " + user.data.username + "." });
        });
    } else if (subcommand === "ratelimits") {
      let usersRateLimits = formatRateLimitsByPremium(userDB) as rateLimitsObject;
      //@ts-ignore
      let currentUsage = interaction.client.userRateLimits.get(userDB.id);
      currentUsage = currentUsage ? currentUsage : {};
      let rateLimitEmbed: MessageEmbedOptions = {
        title: "Your rate limit status:",
        description: "All rate limits reset every hour.",
        fields: [
          {
            name: "Tweet",
            value: `\`${currentUsage.tweet ? currentUsage.tweet.used : 0}/${usersRateLimits.tweet}\``,
            inline: true,
          },
          {
            name: "Follow",
            value: `\`${currentUsage.follow ? currentUsage.follow.used : 0}/${usersRateLimits.follow}\``,
            inline: true,
          },
          {
            name: "Unfollow",
            value: `\`${currentUsage.unfollow ? currentUsage.unfollow.used : 0}/${usersRateLimits.unfollow}\``,
            inline: true,
          },
          {
            name: "Block",
            value: `\`${currentUsage.block ? currentUsage.block.used : 0}/${usersRateLimits.block}\``,
            inline: true,
          },
          {
            name: "Unblock",
            value: `\`${currentUsage.unblock ? currentUsage.unblock.used : 0}/${usersRateLimits.unblock}\``,
            inline: true,
          },
          {
            name: "_ _",
            value: `_ _`,
            inline: true,
          },
        ],
      };
      iFollowUp(interaction, { embeds: [rateLimitEmbed] });
    }
  }
}
