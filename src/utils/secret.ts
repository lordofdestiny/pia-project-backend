import {Data, parse, stringify} from "envfile";
import {readFileSync, writeFileSync, existsSync} from "node:fs";
import {randomFillSync} from "node:crypto";

function generateSecret(length: number) {
    const buffer = Buffer.alloc(length);
    return randomFillSync(buffer).toString("hex");
}

class EnvFile {
    private readonly filePath: string;
    private data: Data | null = null;
    private changes: Data = {};

    private constructor(filePath: string) {
        this.filePath = filePath;
        if (!existsSync(filePath)) {
            throw new Error(`File ${filePath} does not exist`);
        }
    }

    public static from(filePath: string) {
        return new EnvFile(filePath);
    }

    private load() {
        if (this.data != null) return;
        this.data = parse(readFileSync(this.filePath, {encoding: "utf-8"}));
    }

    public save() {
        if (this.data == null) return;
        if (Object.keys(this.changes).length === 0) return;

        // Apply changes to cached data
        this.data = Object.assign(this.data, this.changes);

        // Write changes to file
        writeFileSync(this.filePath, stringify(this.data));

        // Clear changes
        this.changes = {};
    }

    public get(varName: string): string | null {
        this.load();
        return this.data![varName] ?? this.changes[varName] ?? null;
    }

    public set(varName: string, value: string): EnvFile {
        this.changes[varName] = value;
        return this;
    }
}

export function generateAndSaveSecret(
    envFilePath: string,
    varName = "SESSION_SECRET",
    length = 32
) {
    const secret = generateSecret(length);
    EnvFile.from(envFilePath).set(varName, secret).save();
    return secret;
}