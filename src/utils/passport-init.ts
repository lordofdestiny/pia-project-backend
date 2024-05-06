import passport from "passport";
import {Authenticator} from "@utils/authenticate";
import {session_fields} from "@models/user.model";

//Initialize passport
passport.use("local_default", Authenticator.nonAdminStrategy);
passport.use("local_manager", Authenticator.adminStrategy);

passport.serializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        done(null, Object.pickInclusive(user, ...session_fields));
    });
});

passport.deserializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        done(null, user);
    });
});
