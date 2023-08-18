import MongoStore from "connect-mongo";
import session from "express-session";
import MongooseConnect from "../utils/mongoose-connect";

export const Sessions = session({
    secret: process.env.SESSION_SECRET!,
    saveUninitialized: false,
    resave: false,
    rolling: true,
    store: new MongoStore({
        mongoUrl: MongooseConnect.getConnectionURI(),
        autoRemove: "interval",
        ttl: 60 * 60 * 1000, // 1 hour
    }),
});
