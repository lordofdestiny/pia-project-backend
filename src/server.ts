import app from "./app";
import { createServer } from "http";
import os from "os";

const networkInterfacesDict = os.networkInterfaces();
const ipv4 = Object.keys(networkInterfacesDict)
    .map((key) => networkInterfacesDict[key]!)
    .flat()
    .filter(({ family }) => family === "IPv4")
    .filter(({ internal }) => !internal)
    .map(({ address }) => address);

const port = process.env.PORT ?? 3000;

const server = createServer(app);
server.listen(port, () => {
    console.log(`Express server running on ${ipv4}:${port}`);
});
