import path from "path";
import express, { Express, Request, Response } from "express";
import morgan from "morgan";

const app: Express = express();

// Middlewares
app.use(morgan("dev"));

// Public files
// app.use(express.static(path.join(__dirname, "public")));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routers

// Hello world message for testing
app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
});

// Custom 404 error handler
// app.use(errorHandler);

export default app;
