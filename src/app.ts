import path from "path";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import express, { Express, Request, Response } from "express";

// Make sure to import the string utils to extend the String prototype

import {
    notFoundErrorHandler,
    validationErrorHandler,
    logErrorHandler,
    serverErrorHandler,
} from "./middleware/error-handler";
import { Sessions } from "@middleware/session";

import UserRouter from "@routes/user.routes";
import AuthRouter from "@routes/auth.routes";
/* Import the passport-init.ts file to initialize passport
 * with the correct strategies and serialization/deserialization functions
 */
import "@utils/passport-init";

const app: Express = express();

// Enable sessions
app.use(Sessions, passport.initialize(), passport.session());

// Middlewares
app.use(morgan("dev"));

// CORS
app.use(cors({ credentials: false, origin: "*" }));

// Request body parsers
app.use(express.json(), express.urlencoded({ extended: false }));

// Public resource files
app.use(
    express.static(path.resolve(__dirname, "../public"), {
        index: false,
        dotfiles: "ignore",
    })
);

// Routers
app.use("/", UserRouter);
app.use("/auth", AuthRouter);

// Error handlers
app.use(
    notFoundErrorHandler,
    validationErrorHandler,
    logErrorHandler(path.join(process.cwd(), "logs")),
    serverErrorHandler
);

export default app;
