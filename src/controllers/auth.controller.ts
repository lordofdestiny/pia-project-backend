import passport from "passport";
import { HydratedDocument, Types } from "mongoose";
import { Request, Response, NextFunction } from "express";

import { PatientModel, IPatient } from "@models/patient.model";
import { UserModel, IUser, IUserMethods } from "@models/user.model";

interface IChangePasswordBody {
    username?: string;
    old_password?: string;
    new_password?: string;
}

export default class AuthController {
    private static handle_login(
        strategy: "local_default" | "local_manager",
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        return passport.authenticate(strategy, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return response.status(401).jsonp(info);
            }
            if (request.isAuthenticated?.()) {
                return response.status(409).jsonp({ message: "already logged in" });
            }
            request.logIn(user, (err) => {
                if (err) return next(err);
                user.profile_picture = user.relative_profile_picture;
                user.relative_profile_picture = undefined;
                response.status(200).json({ message: "logged in", user });
            });
        })(request, response, next);
    }

    public static login_default = (request: Request, response: Response, next: NextFunction) => {
        return this.handle_login("local_default", request, response, next);
    };

    public static login_manager = (request: Request, response: Response, next: NextFunction) => {
        return this.handle_login("local_manager", request, response, next);
    };

    public static async logout(request: Request, response: Response, next: NextFunction) {
        // if (!request.isAuthenticated()) {
        //     return response.sendStatus(401);
        // }
        request.logout(
            {
                keepSessionInfo: false,
            },
            (err) => {
                if (err) return next(err);
                request.session!.destroy((err) => {
                    if (err) return next(err);
                    response.clearCookie("connect.sid");
                    response.status(200).json({ message: "logged out" });
                });
            }
        );
    }

    public static async changePassword(
        request: Request<{}, {}, IChangePasswordBody>,
        response: Response,
        next: NextFunction
    ) {
        // if (!request.isAuthenticated()) {
        //     return response.sendStatus(401);
        // }
        const id = request?.user?.id;
        const { username, old_password, new_password } = request!.body;
        if (
            (id == undefined && username === undefined) ||
            old_password == undefined ||
            new_password == undefined
        ) {
            return response.status(400).json({ message: "old and new password are required" });
        }
        const getUserPromise = id
            ? UserModel.findById(new Types.ObjectId(id))
            : UserModel.findOne({ username });
        try {
            const user = await getUserPromise;
            if (!user) {
                return response.status(404).json({ message: "user not found" });
            }
            if (!(await user!.comparePassword(old_password))) {
                return response.status(409).json({ message: "old password incorrect" });
            }
            user!.password = new_password;
            await user!.save({ validateModifiedOnly: true });
            request.logout(
                {
                    keepSessionInfo: false,
                },
                (err) => {
                    if (err) return next(err);
                    request.session!.destroy((err) => {
                        if (err) return next(err);
                        response.clearCookie("connect.sid");
                        response.status(200).json({ message: "password updated. logged out" });
                    });
                }
            );
        } catch (err) {
            next(err);
        }
    }

    public static async uniqueCredential(
        request: Request<{}, {}, { value: string; type: string }>,
        response: Response,
        next: NextFunction
    ) {
        const { type, value } = request.body;
        try {
            const user = await UserModel.findOne({
                [type]: value,
            }).lean();
            response.json({ unique: user == null });
        } catch {
            response.json({ unique: false });
        }
    }
}
