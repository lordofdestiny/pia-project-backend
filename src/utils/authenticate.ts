import { EUserRole, IUser, UserModel } from "../models/user";
import { Strategy } from "passport-local";
import { NextFunction, Request, Response } from "express";
import { ManagerModel } from "../models/manager";
export class Authenticator {
    public static readonly nonAdminStrategy = new Strategy(
        { usernameField: "email" },
        this.verifyNonAdmin.bind(this)
    );
    public static readonly adminStrategy = new Strategy(
        { usernameField: "email" },
        this.verifyAdmin.bind(this)
    );

    private static async handleVerify(password, user, done) {
        if (user == null) {
            return done(null, false, {
                message: "user not found",
            });
        }
        if (!(await user.comparePassword(password))) {
            return done(null, false, {
                message: "incorrect password",
            });
        }
        return done(null, user.toObject());
    }

    private static async verifyNonAdmin(email, password, done) {
        try {
            const user = await UserModel.findOne({ email, $nor: [{ type: "manager" }] });
            this.handleVerify(password, user, done);
        } catch (err) {
            return done(err);
        }
    }

    private static async verifyAdmin(email, password, done) {
        try {
            const user = await ManagerModel.findOne({ email });
            this.handleVerify(password, user, done);
        } catch (err) {
            return done(err);
        }
    }

    static authenticate(user_types: EUserRole[]) {
        return (request: Request, response: Response, next: NextFunction) => {
            if (!request.isAuthenticated()) {
                return response.sendStatus(401);
            }
            if (
                !user_types.includes("user" as EUserRole) &&
                !user_types.includes(request.user.type)
            ) {
                return response.sendStatus(403);
            }
            return next();
        };
    }
}
