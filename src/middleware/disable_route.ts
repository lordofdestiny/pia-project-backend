import { Request, Response, NextFunction } from "express";

export function disable(_request: Request, response: Response, next: NextFunction) {
    if (Boolean(process.env.DISABLE_ROUTE)) {
        response.status(404).json({ message: "Route not found" });
    } else {
        next();
    }
}
