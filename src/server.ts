import * as console from "node:console";
import os from "node:os";
import http from "node:http";
import {resolve} from "node:path";
import mongoose from "mongoose";

// Make sure to import the utils to extend the prototypes before importing the app
import "@utils/object";
import "@utils/string";

// Must be imported after mongodb connection is initialized
import app from "./app";
import {generateAndSaveSecret} from "@utils/secret";
import MongooseConnect from "@utils/mongoose-connect";

if (process.env.NODE_ENV === "production") {
    if (process.env.SESSION_SECRET === undefined) {
        console.error("SESSION_SECRET is not set. Exiting...");
        process.exit(1);
    }
}

if (process.env.NODE_ENV === "development") {
    if (process.env.SESSION_SECRET === undefined) {
        console.error("SESSION_SECRET is not set. Generating a new secret key and saving it to .env file");
        generateAndSaveSecret(resolve("./", ".env"));
    }
    console.log("Running in development mode...");
}


function onServerClose(exitCode: number = 0) {
    return async () => {
        console.log("Shutting down...");
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        console.log('Exiting...');
        process.exit(exitCode);
    }
}

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server...');
    server.close(onServerClose(0));
})

process.on('SIGINT', () => {
    console.log('SIGINT signal received. Closing HTTP server...');
    server.close(onServerClose(0));
})

process.on('uncaughtException', async (err) => {
    const errConsole = new console.Console(process.stderr);
    errConsole.error(`* Uncaught ${err.name ?? "error"}:`);
    errConsole.group(" ", err);
    await onServerClose(1)();
});

const port = process.env.PORT ?? 3000;
const server = http.createServer(app);

async function mongooseConnect() {
    try {
        await MongooseConnect.connect(MongooseConnect.getConnectionURI());
        console.log(`Connected to MongoDB as <${mongoose.connection.user ?? "default"}>`);
    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err}`);
        console.error(err);
        process.exit(1);
    }
}

// Display the IP and port the server is running on
function listenHandler() {
    const networkInterfacesDict = os.networkInterfaces();
    const ipv4 = Object.keys(networkInterfacesDict)
        .map((key) => networkInterfacesDict[key]!)
        .flat()
        .filter(({family}) => family === "IPv4")
        .filter(({internal}) => !internal)
        .map(({address}) => address)

    console.log(`Express server running on: `);
    for (const ip of ipv4) {
        console.log(`* ${ip}:${port}`);
    }
}

(async () => {
    // Try to connect to MongoDB before starting the server
    await mongooseConnect();
    // Start the server
    server.listen(port, listenHandler);
})();