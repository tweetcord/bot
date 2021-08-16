declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      TWITTER_BEARER: string;
      SENTRY: string;
      DATABASE_URL: string;
    }
  }
}

export {}