import path from "path";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import express, { Express, Request, Response } from "express";

// Make sure to import the string utils to extend the String prototype

import {
    notFoundErrorHandler,
    validationErrorHandler,
    logErrorHandler,
    serverErrorHandler,
} from "./middleware/error-handler";

import { EUserRole, IUser, SessionUser, session_fields } from "./models/user";
import { Authenticator } from "./utils/authenticate";
import MongooseConnect from "./utils/mongoose-connect";
import UserRouter from "./routes/user.routes";
import AuthRouter from "./routes/auth.routes";

const app: Express = express();

// Enable sessions
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        saveUninitialized: false,
        resave: false,
        rolling: true,
        store: new MongoStore({
            mongoUrl: MongooseConnect.getConnectionURI(),
            autoRemove: "interval",
            ttl: 60 * 60 * 1000, // 1 hour
        }),
    })
);

//Initialize passport
passport.use("local_default", Authenticator.nonAdminStrategy);
passport.use("local_manager", Authenticator.adminStrategy);
passport.serializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        const serialized_user: SessionUser = Object.pick(user, ...session_fields);
        done(null, serialized_user);
    });
});
passport.deserializeUser((user: Express.User, done) => {
    process.nextTick(() => {
        done(null, user);
    });
});
app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(morgan("dev"));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Public files
app.use(express.static(path.join(__dirname, "public")));

// Routers
// how to verify jwt token
app.get(
    "/secret",
    Authenticator.authenticate([EUserRole.USER]),
    (request: Request, response: Response) => {
        const { first_name, last_name } = request.user!;
        const fullName = `${first_name} ${last_name}`.toTitleCase();
        response.json({ message: `success! Hello, ${fullName}!` });
    }
);

app.use("/user", UserRouter);
app.use("/auth", AuthRouter);

// Error handlers
app.use(notFoundErrorHandler);
app.use(validationErrorHandler);
app.use(logErrorHandler(path.join(process.cwd(), "logs")));
app.use(serverErrorHandler);

export default app;
