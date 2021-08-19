import { ClientOptions, Options } from "discord.js";

export const clientOptions: ClientOptions = {
  allowedMentions: {
    parse: ["users"],
    repliedUser: true,
  },
  userAgentSuffix: ["Tweetcord/1.0.0"],
  makeCache: Options.cacheWithLimits({
    BaseGuildEmojiManager: 0,
    GuildMemberManager: {
      maxSize: 0,
      keepOverLimit: (v) => v.id === v.client.user!.id,
    },
    GuildBanManager: 0,
    GuildInviteManager: 0,
    GuildStickerManager: 0,
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: {
      maxSize: 0,
      keepOverLimit: (v) => v.id === v.client.user!.id,
    },
    VoiceStateManager: 0,
  }),
  restRequestTimeout: 60e3,
  presence: {
    activities: [
      {
        name: "tweets",
        type: "WATCHING",
      },
    ],
  },
  intents: 1585,
};
