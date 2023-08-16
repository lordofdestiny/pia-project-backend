import os from "os";
import http from "http";
import { resolve } from "path";
import mongoose from "mongoose";

import "./types/types";
import "./utils/string";

import app from "./app";
import { generateAndSaveSecret } from "./utils/secret";
import MongooseConnect from "./utils/mongoose-connect";

const port = process.env.PORT ?? 3000;

// Get local IPv4 address of the machine
const networkInterfacesDict = os.networkInterfaces();
const ipv4 = Object.keys(networkInterfacesDict)
    .map((key) => networkInterfacesDict[key]!)
    .flat()
    .filter(({ family }) => family === "IPv4")
    .filter(({ internal }) => !internal)
    .map(({ address }) => address);

// Setup MongoDB connection
const mongoDBConnectionDetails = MongooseConnect.getConnectionDetailsFromEnv();
const mongooseConnectionURI = MongooseConnect.buildConnectionURI(mongoDBConnectionDetails);
MongooseConnect.initialize();

// Loa secret key for JWT
if (process.env.JWT_SECRET === undefined) {
    generateAndSaveSecret(resolve("./", ".env"));
}

const server = http.createServer(app);

server.listen(port, async () => {
    console.log(`Express server running on ${ipv4}:${port}`);
    try {
        await MongooseConnect.connect(mongooseConnectionURI);
        console.log(`Connected to MongoDB as <${mongoose.connection.user ?? "local dev"}>`);
    } catch (err) {
        console.log(`Error connecting to MongoDB: ${err}`);
    }
});
