import path from "path";
import morgan from "morgan";
import passport from "passport";
import express, { Express, Request, Response } from "express";

// Make sure to import the string utils to extend the String prototype

import userRouter from "./routes/user.routes";
import {
    notFoundErrorHandler,
    validationErrorHandler,
    logErrorHandler,
    serverErrorHandler,
} from "./middleware/error-handler";

import JWTStrategy from "./strategies/jwt";

const app: Express = express();

//Initialize passport
passport.use(JWTStrategy);
app.use(passport.initialize());

// Middlewares
app.use(morgan("dev"));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Public files
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.get(
    "/secret",
    passport.authenticate("jwt", { session: false, assignProperty: "user" }),
    ({ user }: Request, response: Response) => {
        const { first_name, last_name } = user!;
        const fullName = `${first_name} ${last_name}`.toTitleCase();
        response.json({ message: `success! Hello, ${fullName}!` });
    }
);

app.use("/user", userRouter);

// Error handlers
app.use(notFoundErrorHandler);
app.use(validationErrorHandler);
app.use(logErrorHandler(path.join(process.cwd(), "logs")));
app.use(serverErrorHandler);

export default app;
