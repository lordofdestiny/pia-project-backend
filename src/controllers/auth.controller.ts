import { Request, Response, NextFunction } from "express";

import Patient, { IPatient } from "../models/patient";
import { UserModel, IUser, IUserMethods } from "../models/user";
import { HydratedDocument, Types } from "mongoose";
import passport from "passport";

interface IChangePasswordBody {
    old_password?: string;
    new_password?: string;
}

export default class AuthController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await Patient.create(data);
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }

    public static async login(request: Request, response: Response, next: NextFunction) {
        passport.authenticate("local_user", (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return response.status(401).json(info);
            }
            request.logIn(user, (err) => {
                if (err) return next(err);
                response.status(200).json({ message: "logged in" });
            });
        })(request, response, next);
    }

    public static async logout(request: Request, response: Response, next: NextFunction) {
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
        const {
            user: { id } = {},
            body: { old_password, new_password },
        } = request;

        if (old_password == undefined || new_password == undefined) {
            return response.status(400).json({ message: "old and new password are required" });
        }
        try {
            const user = await UserModel.findById(new Types.ObjectId(id));
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
}
