import { Request, Response, NextFunction } from "express";

export default function (request: Request, response: Response, next: NextFunction) {
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
