import { NextFunction, Request, Response } from "express";
import { MongooseError, Error } from "mongoose";

function makeResponseObject(error: MongooseError) {
    return {
        name: error.name,
        cause: error.cause,
        message: error.message,
        stack: error.stack,
    };
}

export async function mongooseErrorHandler(
    error: MongooseError,
    _request: Request,
    response: Response,
    next: NextFunction
) {
    switch (error.name) {
        case "ValidationError":
            const { errors } = error as Error.ValidationError;
            return response.status(422).json({ errors });
        default:
            next(error);
    }
}

export async function serverErrorHandler(
    _error: Error,
    _request: Request,
    response: Response,
    next: NextFunction
) {
    response.status(500).send("500: Internal Server Error");
}
