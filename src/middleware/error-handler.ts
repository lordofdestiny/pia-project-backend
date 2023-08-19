import { resolve } from "path";
import { writeFile } from "fs/promises";
import { lstatSync, mkdirSync } from "fs";
import { MongooseError, Error } from "mongoose";
import { NextFunction, Request, Response } from "express";

export function notFoundErrorHandler(request: Request, response: Response, next: NextFunction) {
    const obj = {
        message: "Not found",
        method: request.method,
        route: request.url,
    };
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
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
    _next: NextFunction
) {
    response.sendStatus(500);
}
