import mongoose from "mongoose";
import { EUserRole } from "../models/user";
import { Strategy } from "passport-local";
import passport from "passport";
import { NextFunction, Request, Response } from "express";

export class Authenticator {
    private static readonly typeStrategies = new Map(
        Object.values(EUserRole).map((key) => [key, new Authenticator(key)])
    );
    constructor(private user_type: EUserRole) {}

    private readonly strategy = new Strategy({ usernameField: "email" }, this.verify.bind(this));

    private async verify(email, password, done) {
        try {
            const user = await mongoose.model(this.user_type.toTitleCase()).findOne({ email });
            if (user == null) {
                return done(null, false, {
                    message: "user not found",
                });
            }
            if (await user.comparePassword(password)) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: "incorrect password",
                });
            }
        } catch (err) {
            return done(err);
        }
    }
    public static getStrategy(user_type: EUserRole): [string, Strategy] {
        return [`local_${user_type}`, Authenticator.typeStrategies.get(user_type)!.strategy];
    }

    static authenticate(user_types: EUserRole[]) {
        return (request: Request, response: Response, next: NextFunction) => {
            if (!request.isAuthenticated()) {
                return response.status(401).json({ message: "unauthorized" });
            }
            if (!user_types.includes(EUserRole.USER) && !user_types.includes(request.user.type)) {
                return response.status(403).json({ message: "forbidden" });
            }
            return next();
        };
    }
}
