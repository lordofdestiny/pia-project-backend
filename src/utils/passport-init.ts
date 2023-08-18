import passport from "passport";
import path from "path";
import { Authenticator } from "./authenticate";
import { SessionUser, session_fields } from "../models/user";
import { relativizePicturePath } from "./util";

//Initialize passport
passport.use("local_default", Authenticator.nonAdminStrategy);
passport.use("local_manager", Authenticator.adminStrategy);

passport.serializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        done(null, Object.pick(user, ...session_fields));
    });
});

passport.deserializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        done(null, user);
    });
});
