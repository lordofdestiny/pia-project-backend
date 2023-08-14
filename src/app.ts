import express, { Express, Request, Response } from "express";
import morgan from "morgan";
import notFound from "./middleware/not-found";
import userRouter from "./routes/user.routes";
import { serverErrorHandler, mongooseErrorHandler } from "./utils/error-handler";

const app: Express = express();

// Middlewares
app.use(morgan("dev"));
// Public files
// app.use(express.static(path.join(__dirname, "public")));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routers
app.use("/user", userRouter);

// Custom 404 error handler
app.use(notFound);
app.use(mongooseErrorHandler);
app.use(serverErrorHandler);

export default app;
