import path from "node:path";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import express, {Express} from "express";

import {
    notFoundErrorHandler,
    validationErrorHandler,
    logErrorHandler,
    serverErrorHandler,
} from "@middleware/error-handler";
import {Sessions} from "@middleware/session";

import {UserRouter} from "@routes/user.routes";
import {AuthRouter} from "@routes/auth.routes";
import {AppointmentsRouter} from "@routes/appointments.routes";
import {SpecializationRouter} from "@routes/specialization.routes";

/*
 * Import the passport-init.ts file to initialize passport
 * with the correct strategies and serialization/deserialization functions
 */
import "@utils/passport-init";

type Environment = "production" | "development";
const environment: Environment = (process.env.NODE_ENV ?? 'development') as Environment;

const app: Express = express();

// Enable sessions
app.use(Sessions, passport.initialize(), passport.session());

// Middlewares
app.use(morgan("dev"));

// CORS
app.use(cors({credentials: false, origin: "*"}));

// Request body parsers
app.use(express.json(), express.urlencoded({extended: false}));

// Public resource files
app.use(
    express.static(path.resolve(__dirname, "..", "public"), {
        index: false,
        dotfiles: "ignore",
    })
);


const api_router = express.Router();
api_router.use("/", UserRouter);
api_router.use("/auth", AuthRouter);
api_router.use("/appointments", AppointmentsRouter);
api_router.use("/specialization", SpecializationRouter);

app.use("/api", api_router);

// Serve the frontend if in production
if (environment === "production") {
    app.use(express.static(path.resolve(__dirname, "..", "website"), {
            dotfiles: "ignore",
            etag: false,
            index: false,
            extensions: ["html", "js", "css", "scss"],
            maxAge: '1y',
            redirect: true,
        }),
        (_, res) => {
            res.sendFile(path.resolve(__dirname, "..", "website", "index.html"));
        });
}

// Error handlers
app.use(
    notFoundErrorHandler,
    validationErrorHandler,
    logErrorHandler(path.join(process.cwd(), "logs")),
    serverErrorHandler
);

export default app;
