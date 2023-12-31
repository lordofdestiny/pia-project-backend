import { Strategy } from "passport-local";
import { NextFunction, Request, Response } from "express";
import { ManagerModel } from "@models/manager.model";
import { EUserRole, UserModel } from "@models/user.model";
export class Authenticator {
    public static readonly nonAdminStrategy = new Strategy(this.verifyNonAdmin.bind(this));
    public static readonly adminStrategy = new Strategy(this.verifyAdmin.bind(this));

    private static async verifyNonAdmin(username, password, done) {
        try {
            const user = await UserModel.findOne({ username, $nor: [{ type: "manager" }] });
            this.handleVerify(password, user, done);
        } catch (err) {
            return done(err);
        }
    }

    private static async verifyAdmin(username, password, done) {
        try {
            const user = await ManagerModel.findOne({ username });
            this.handleVerify(password, user, done);
        } catch (err) {
            return done(err);
        }
    }

    private static async handleVerify(password, user, done) {
        if (user == null) {
            return done(null, false, {
                message: "user not found",
            });
        }
        if (user.type === "patient" && user.status !== "active") {
            return done(null, false, {
                message: "user not active",
            });
        }
        if (!(await user.comparePassword(password))) {
            return done(null, false, {
                message: "incorrect password",
            });
        }
        if (user.type === "patient") {
            await user.populate({
                path: "notifications.notification",
            });
        }
        if (user?.type === "doctor") {
            await user.populate({
                path: "specialization",
                populate: {
                    path: "examinations",
                    match: {
                        status: "active",
                    },
                },
            });
            await user.populate({
                path: "examinations",
                match: {
                    status: "active",
                },
            });
        }
        return done(null, user!.toObject({ virtuals: true }));
    }

    static authenticate(user_types: Exclude<EUserRole, EUserRole.USER>[]) {
        if (!(process.env.SECURITY === "true")) {
            return (_request: Request, _response: Response, next: NextFunction) => {
                return next();
            };
        }
        return (request: Request, response: Response, next: NextFunction) => {
            if (!request.isAuthenticated()) {
                return response.sendStatus(401);
            }
            if (!user_types.includes(request.user.type)) {
                return response.sendStatus(403);
            }
            return next();
        };
    }
}
