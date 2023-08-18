import { readFile, writeFile } from "fs/promises";
import { parse, stringify } from "envfile";
import { randomFill as randomFill0 } from "crypto";
import { promisify } from "util";

async function randomFill(buffer) {
    return <Buffer>await promisify(randomFill0)(buffer);
}

async function generateSecret(length) {
    const buffer = Buffer.alloc(length);
    return (await randomFill(buffer)).toString("hex");
}

export async function generateAndSaveSecret(
    envFilePath: string,
    varName = "SESSION_SECRET",
    length = 32
) {
    const secret = await generateSecret(length);
    const fileText = parse(await readFile(envFilePath, { encoding: "utf-8" }));
    const fileTextNew = await stringify(Object.assign(fileText, { [varName]: secret }));
    await writeFile(envFilePath, fileTextNew);
    return secret;
}
