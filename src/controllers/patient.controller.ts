import path from "path";
import { unlink } from "fs/promises";
import { MongooseError, Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { UserModel, IUser } from "@models/user";
import { PatientModel, IPatient } from "@models/patient";
import { default_profile_picture, relativizePicturePath } from "@utils/util";

export default class PatientController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        if (request.isAuthenticated()) {
            return response.status(409).json({ message: "already logged in" });
        }
        if (request.file === undefined && (request.file_not_image ?? false)) {
            return response.status(400).json({ message: "file that was send was not an image" });
        }
        const { body: data } = request;
        const profile_picture = request.file?.path ?? default_profile_picture;
        try {
            const user = await PatientModel.create({ ...data, profile_picture });
            const userObj = user.toObject();
            Object.assign(userObj, {
                profile_picture: userObj.relative_profile_picture,
                relative_profile_picture: undefined,
            });
            response.status(201).json(userObj);
        } catch (err) {
            next(err);
        }
    }

    public static async get_profile(request: Request, response: Response, next: NextFunction) {
        if (!request.isAuthenticated()) {
            return response.sendStatus;
        }
        try {
            return response.status(200).json({ ...request.user, id: undefined, type: undefined });
        } catch (error) {
            return next(error);
        }
    }

    public static async get_avatar(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        if (!request.isAuthenticated()) {
            return response.sendStatus(401);
        }
        response.json({
            avatar: request.user?.profile_picture,
        });
    }

    public static async update_profile(request: Request, response: Response, next: NextFunction) {
        if (!request.isAuthenticated()) {
            return response.sendStatus;
        }
        const { body: data } = request;
        try {
            const user = await PatientModel.findById(request.user.id)!;
            if (user == null) {
                return response.sendStatus(500);
            }
            Object.assign(user, data);
            await user?.save({ validateModifiedOnly: true });
            request.session.reload((err) => {
                if (err) next(err);
                return response.status(200).json(
                    Object.assign(user.toObject(), {
                        id: undefined,
                        type: undefined,
                    })
                );
            });
        } catch (error) {
            next(error);
        }
    }

    public static async update_avatar(request: Request, response: Response, next: NextFunction) {
        if (!request.isAuthenticated()) {
            return response.sendStatus;
        }
        if (request.file === undefined) {
            if (request.file_not_image == undefined) {
                return response.status(400).json({ message: "no file was sent" });
            } else if (request.file_not_image) {
                return response
                    .status(400)
                    .json({ message: "file that was send was not an image" });
            }
        }
        const profile_picture = request.file!.path;
        try {
            const user = await PatientModel.findById(request.user.id);
            const old_profile_picture = user!.profile_picture;
            user!.profile_picture = profile_picture;
            await user!.save({ validateModifiedOnly: true });
            await unlink(old_profile_picture);
            request.session.reload((err) => {
                if (err) next(err);
                response.status(200).json({ new_avatar: relativizePicturePath(profile_picture) });
            });
        } catch (err) {
            next(err);
        }
    }
}
