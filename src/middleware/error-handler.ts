import { NextFunction, Request, Response } from "express";
import { MongooseError, Error } from "mongoose";
import { writeFile } from "fs/promises";
import { existsSync, lstatSync, mkdirSync } from "fs";
import { resolve } from "path";

export function notFoundErrorHandler(request: Request, response: Response, next: NextFunction) {
    const obj = {
        message: "Not found",
        method: request.method,
        route: request.url,
    };
    if (request.method in ["POST", "PUT", "PATCH"]) {
        Object.assign(obj, { body: request.body });
    }
    response.status(404).json(obj);
}

export async function validationErrorHandler(
    error: MongooseError,
    _request: Request,
    response: Response,
    next: NextFunction
) {
    switch (error.name) {
        case "ValidationError":
            const { errors } = error as Error.ValidationError;
            return response.status(422).json({ errors, data: _request.body });
        default:
            next(error);
    }
}

export function logErrorHandler(absoluteFolderPath: string) {
    try {
        if (!lstatSync(absoluteFolderPath).isDirectory()) {
            throw new Error("Path is not a directory");
        }
    } catch (error) {
        try {
            mkdirSync(absoluteFolderPath);
            console.log(`Created folder at ${absoluteFolderPath}`);
        } catch (error) {
            throw new Error("Folder at given path does not exist and could not be created");
        }
    }

    return async function name(
        error: Error,
        request: Request,
        _response: Response,
        next: NextFunction
    ) {
        JSON.stringify(
            {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            },
            null,
            "\t"
        );
        const { method, path: route } = request;
        const time = new Date();
        const timestamp = Math.ceil(time.getTime() / 1000);
        const filename = `${timestamp} ${method} ${route.replaceAll("/", ".")}.log`;
        console.log(filename);
        const filepath = resolve(absoluteFolderPath, filename);

        await writeFile(
            filepath,
            `name : ${error.name}\n
            message : ${error.message}\n
            stack : \n${error.stack}`,
            { encoding: "utf-8", flag: "w" }
        );

        next(error);
    };
}

export async function serverErrorHandler(
    _error: Error,
    _request: Request,
    response: Response,
    next: NextFunction
) {
    response.status(500).send("500: Internal Server Error");
}
