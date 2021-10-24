import { ClientOptions, Intents, MessageActionRow, Options } from "discord.js";

export const clientOptions: ClientOptions = {
    allowedMentions: {
        parse: ["users"],
        repliedUser: true,
    },
    userAgentSuffix: ["Tweetcord/1.0.0"],
    shards: "auto",
    makeCache: Options.cacheWithLimits({
        BaseGuildEmojiManager: 0,
        GuildMemberManager: {
            sweepInterval: 3600,
            keepOverLimit: (v) => v.id === v.client.user!.id,
        },
        GuildBanManager: 0,
        // @ts-ignore
        GuildEmojiManager: 0,
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
            sweepInterval: 3600,
            keepOverLimit: (v) => v.id === v.client.user!.id,
        },
        VoiceStateManager: 0,
    }),
    restRequestTimeout: 60e3,
    presence: {
        activities: [
            {
                name: "slash commands",
                type: "LISTENING",
            },
        ],
    },
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
};

export const TweetsCollectorEndButtons = new MessageActionRow().addComponents(
    {
        customId: "first",
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    },
    {
        customId: "previous",
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    },
    {
        customId: "next",
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    },
    {
        customId: "last",
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    }
);

export const TweetsRow = new MessageActionRow().addComponents(
    {
        customId: "first",
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
    },
    {
        customId: "previous",
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
    },
    {
        customId: "next",
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
    },
    {
        customId: "last",
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
    }
);

export const TweetsFirstRow = new MessageActionRow().addComponents(
    {
        customId: "first",
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    },
    {
        customId: "previous",
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    },
    {
        customId: "next",
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
    },
    {
        customId: "last",
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
    }
);

export const TweetsLastRow = new MessageActionRow().addComponents(
    {
        customId: "first",
        emoji: "860524771832496138",
        style: "PRIMARY",
        type: "BUTTON",
    },
    {
        customId: "previous",
        emoji: "860524798181900308",
        style: "PRIMARY",
        type: "BUTTON",
    },
    {
        customId: "next",
        emoji: "860524837675073556",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    },
    {
        customId: "last",
        emoji: "860524885230223370",
        style: "PRIMARY",
        type: "BUTTON",
        disabled: true,
    }
);

export const emojis = {
    t: "<:ytick:738935932907946044> ",
    f: "<:xtick:738936304565354497> ",
};
