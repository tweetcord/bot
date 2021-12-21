import passport from "passport";
const TwitterStrategy = require("passport-twitter").Strategy;

passport.serializeUser(function (user, done) {
  console.log("Serialize:", user);
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  //@ts-ignore
  done(null, user);
});
passport.use(
  new TwitterStrategy(
    {
      consumerKey: "eL6OXdMUqVMBFWexNQsXg0T8Q",
      consumerSecret: "r2K7uhYQjeWOlNU02JoMxcXuC5suOjGIsXMG9xKcMPpLcnIzjL",
      callbackURL: "http://www.localhost:3001/auth/twitter/callback",
    },
    function (_accessToken: any, _refreshToken: any, profile: any, done: any) {
      console.log("profile:", profile);
      return done(null, profile);
    }
  )
);
