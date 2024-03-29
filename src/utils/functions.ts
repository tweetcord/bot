import { Client, TextChannel, Interaction, MessageEmbedOptions, CommandInteraction, MessageActionRow, InteractionReplyOptions, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { hyperlink } from "@discordjs/builders";
import Axios from "axios";
import { userRateLimits } from "../constants";

export const createWebhook = async (client: Client, channel: TextChannel, guildId: string): Promise<any> => {
  try {
    let webhook = await channel?.createWebhook("Tweetcord Notification");
    if (!webhook) return;
    let webhookDb = await client.prisma.webhook.create({
      data: {
        webhookId: webhook.id,
        webhookToken: webhook.token as string,
        guildId: guildId,
        channelId: channel.id,
      },
    });
    return webhookDb;
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

export const getGuildData = async (interaction: Interaction): Promise<any> => {
  return await interaction.client.prisma.guild.findFirst({
    where: {
      id: interaction.guild?.id,
    },
    include: {
      feeds: true,
      webhooks: true,
    },
  });
};

export const getWebhookData = async (client: Client, channelId: string): Promise<any> => {
  let webhook = await client.prisma.webhook.findFirst({
    where: {
      channelId: channelId,
    },
  });
  return webhook;
};
//@ts-ignore
export const deleteWebhook = async (client: Client, id: string, webhookId: string, webhookToken: string): Promise<any> => {
  await Axios.delete(`https://discord.com/api/webhooks/${webhookId}/${webhookToken}`).catch((e) => {
    console.log("Error on delete webhook: ", e);
  });
};
export const reCreateWebhook = async (client: Client, webhook: any, webhookOptions: Object): Promise<any> => {
  await client.prisma.webhook.delete({
    where: {
      id: webhook.id,
    },
  });
  let channel = client.channels.cache.get(webhook.channelId);
  let newWebhook = await createWebhook(client, channel as TextChannel, webhook.guildId);
  newWebhook && sendWebhookMessage(client, newWebhook, webhookOptions);
};

export const removeFeed = async (client: Client, id: string): Promise<any> => {
  return await client.prisma.feed.deleteMany({
    where: {
      id,
    },
  });
};

export const removeFeedByChannel = async (client: Client, channelID: string, guildId: string): Promise<any> => {
  return await client.prisma.feed.deleteMany({
    where: {
      channel: channelID,
      guildId: guildId,
    },
  });
};

export const removeGuildData = async (client: Client, guildId: string, db?: any): Promise<any> => {
  await client.prisma.feed.deleteMany({
    where: {
      guildId: guildId,
    },
  });
  await client.prisma.webhook.deleteMany({
    where: {
      guildId: guildId,
    },
  });
  if (db && db.webhooks.length > 0) {
    for (let webhook of db.webhooks) {
      await Axios.delete(`https://discord.com/api/webhooks/${webhook.webhookId}/${webhook.webhookToken}`).catch((e) => {
        if (e.response.code === 20029) {
          return "Rate Limited";
        }
        return e.response.message;
      });
    }
  }
  await client.prisma.guild.deleteMany({
    where: {
      id: guildId,
    },
  });
};

export const formatString = (str: string, obj: Object): string => {
  let temp = str.replace(/{\s*(\w+)\s*}/g, (_match, p1) => {
    return obj[p1];
  });
  temp = temp.replace(/{%\s*(\w+)\s*%}/g, "{{ $1 }}");
  return temp;
};

export const sendWebhookMessage = (client: Client, webhook: any, webhookOptions: Object) => {
  console.log("Sent Tweet Notification: " + webhook.channelId);
  try {
    Axios.post(`https://discord.com/api/webhooks/${webhook.webhookId}/${webhook.webhookToken}`, webhookOptions, {
      headers: { "Content-Type": "application/json" },
    }).catch(async (e) => {
      if (e.response && e.response.data.message === "Unknown Webhook") {
        await reCreateWebhook(client, webhook, webhookOptions);
      }
      console.log(e.response);
    });
  } catch (e) {}
};

export const formatTweets = async (text: string): Promise<string> => {
  return text
    .replaceAll("\n", " \n")
    .split(" ")
    .map((word: string) => {
      let tempWord = word.replace(":", "");
      if (word.startsWith("@")) return (word = hyperlink(word, "https://twitter.com/" + tempWord.substring(1)));
      if (word.startsWith("#")) return (word = hyperlink(word, "https://twitter.com/search?q=%23" + tempWord.substring(1)));
      if (word.startsWith("https://t.co")) return (word = "");
      return word;
    })
    .join(" ");
};

export const checkNSFW = (interaction: CommandInteraction): boolean => {
  if (["693445343332794408", "300573341591535617", "534099893979971584", "548547460276944906"].includes(interaction.user.id)) return true;
  let channel = interaction.channel as TextChannel;
  let embed: MessageEmbedOptions = {
    description: "You have to use this command in NSFW marked channels.",
    image: {
      url: "https://cdn.discordapp.com/attachments/70868118746ß7591742/714053896212971571/NSFW.gif",
    },
  };
  !channel.nsfw && iFollowUp(interaction, { embeds: [embed] });
  return channel.nsfw;
};

export const updateFeed = async (interaction: Interaction, id: string, message: string, replies: boolean, retweets: boolean) => {
  await interaction.client.prisma.feed.update({
    where: {
      id,
    },
    data: {
      message,
      replies,
      retweets,
    },
  });
};

export const getButtons = (id: string): Array<MessageActionRow> => {
  return [
    new MessageActionRow().addComponents(
      {
        customId: "first-" + id,
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
      },
      {
        customId: "previous-" + id,
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
      },
      {
        customId: "next-" + id,
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
      },
      {
        customId: "last-" + id,
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
      }
    ),
    new MessageActionRow().addComponents(
      {
        customId: "first-" + id,
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
      },
      {
        customId: "previous-" + id,
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
      },
      {
        customId: "next-" + id,
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
      },
      {
        customId: "last-" + id,
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
      }
    ),
    new MessageActionRow().addComponents(
      {
        customId: "first-" + id,
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
      },
      {
        customId: "previous-" + id,
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
      },
      {
        customId: "next-" + id,
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
      },
      {
        customId: "last-" + id,
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
      }
    ),
  ];
};

export const resolveColor = (color: any): any => {
  if (typeof color === "string") {
    if (color === "RANDOM") return Math.floor(Math.random() * (0xffffff + 1));
    if (color === "DEFAULT") return 0;
    color = parseInt(color.replace("#", ""), 16);
  } else if (Array.isArray(color)) {
    color = (color[0] << 16) + (color[1] << 8) + color[2];
  }

  if (color < 0 || color > 0xffffff) throw new RangeError("COLOR_RANGE");
  else if (Number.isNaN(color)) throw new TypeError("COLOR_CONVERT");

  return color;
};

export const iDefer = async (interaction: CommandInteraction | MessageComponentInteraction, options?: InteractionReplyOptions) => {
  try {
    await interaction.deferReply(options);
  } catch (e) {
    console.log("Can't defer interaction");
  }
};
export const iDeferUpdate = async (interaction: SelectMenuInteraction | MessageComponentInteraction, options?: InteractionReplyOptions) => {
  try {
    await interaction.deferUpdate(options);
  } catch (e) {
    console.log("Can't defer update interaction");
  }
};
export const iFollowUp = async (interaction: CommandInteraction, options: InteractionReplyOptions) => {
  try {
    await interaction.followUp(options);
  } catch (e) {
    console.log("Can't followUp interaction");
  }
};
export const iEdit = async (interaction: CommandInteraction | MessageComponentInteraction, options: InteractionReplyOptions) => {
  try {
    await interaction.editReply(options);
  } catch (e) {
    console.log("Can't edit interaction");
  }
};

export const iReply = async (interaction: CommandInteraction, options: InteractionReplyOptions) => {
  try {
    await interaction.reply(options);
  } catch (e) {
    console.log("Can't reply interaction", e);
  }
};

export const iEditReply = async (interaction: CommandInteraction | MessageComponentInteraction, options: InteractionReplyOptions) => {
  try {
    await interaction.editReply(options);
  } catch (e) {
    console.log("Can't edit reply interaction", e);
  }
};

export const checkUserRateLimits = (interaction: CommandInteraction, user: any) => {
  let commandType = interaction.options.getSubcommand(true);
  if (commandType === "ratelimits") return false;
  //@ts-ignore
  let userLimit = interaction.client.userRateLimits.get(user.id);
  if (!userLimit) {
    //@ts-ignore
    userLimit = interaction.client.userRateLimits
      .set(user.id, {
        [commandType]: {
          used: 0,
          until: Date.now() + 1000 * 60 * 60,
        },
      })
      .get(user.id);
  } else if (!userLimit[commandType]) {
    //@ts-ignore
    userLimit = interaction.client.userRateLimits
      .set(user.id, {
        ...userLimit,
        [commandType]: {
          used: 0,
          until: Date.now() + 1000 * 60 * 60,
        },
      })
      .get(user.id);
  }

  if (userLimit) userLimit = checkUserRateLimitsUntil(interaction, user);
  if (!userLimit || !userLimit[commandType]) return false;
  let maxLimitOfCommand = formatRateLimitsByPremium(user)[commandType];
  if (userLimit[commandType].used === maxLimitOfCommand) {
    return userLimit[commandType].until;
  }

  //@ts-ignore
  interaction.client.userRateLimits.set(user.id, {
    [commandType]: {
      used: userLimit[commandType].used + 1,
      until: userLimit[commandType].until,
    },
  });
  return false;
};

export const formatRateLimitsByPremium = (user: any) => {
  let formatted = {};
  Object.entries(userRateLimits).map((sub) => {
    sub.map((defaults) => {
      if (typeof defaults == "object") {
        formatted[sub[0]] = user.premium ? defaults.premium : defaults.normal;
      }
    });
  });
  return formatted;
};

export const checkUserRateLimitsUntil = (interaction: CommandInteraction, user: any) => {
  //@ts-ignore
  let userLimit = interaction.client.userRateLimits.get(user.id);
  if (!userLimit) return;
  let entries = Object.entries(userLimit).map((sub) => {
    if ((sub[1] as any).until < Date.now()) {
      return undefined;
    }
    return sub;
  });
  //@ts-ignore
  return interaction.client.userRateLimits.set(user.id, Object.fromEntries(entries.filter((sub) => sub))).get(user.id);
};
