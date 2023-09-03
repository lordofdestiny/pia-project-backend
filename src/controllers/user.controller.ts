import { unlink } from "fs/promises";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "@models/user.model";
import { relativizePicturePath } from "@utils/util";
import { default_profile_picture } from "@utils/util";
import path from "path";

export default class UserController {
    public static async get_profile(request: Request, response: Response, next: NextFunction) {
        // if (!request.isAuthenticated()) {
        //     return response.sendStatus;
        // }
        try {
            return response.status(200).json({ ...request.user, id: undefined, type: undefined });
        } catch (error) {
            return next(error);
        }
    }

    public static async update_profile(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        if (request.isAuthenticated()) {
            return UserController.update_profile_session(request, response, next);
        }
        const { id } = request.params;
        const { body: data } = request;
        try {
            const user = await UserModel.findOneAndUpdate(
                { _id: id },
                {
                    $set: data,
                },
                {
                    new: true,
                    validateModifiedOnly: true,
                }
            ).lean({ virtuals: true });
            return response.status(200).json(
                Object.assign(user as any, {
                    profile_picture: user?.relative_profile_picture,
                    relative_profile_picture: undefined,
                })
            );
        } catch (error) {
            next(error);
        }
    }

    private static async update_profile_session(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        if (!request.isAuthenticated()) {
            return response.sendStatus;
        }
        const { body: data } = request;
        try {
            const user = await UserModel.findById(request.user.id)!;
            if (user == null) {
                return response.sendStatus(500);
            }
            Object.assign(user, data);
            await user?.save({ validateModifiedOnly: true });
            request.session.reload((err) => {
                if (err) next(err);
                return response.status(200).json(
                    Object.assign(user.toObject(), {
                        type: undefined,
                    })
                );
            });
        } catch (error) {
            next(error);
        }
    }

    public static async update_avatar(request: Request, response: Response, next: NextFunction) {
        if (request.file === undefined) {
            if (request.file_not_image == undefined) {
                return response.status(400).json({ message: "no file was sent" });
            } else if (request.file_not_image) {
                return response
                    .status(400)
                    .json({ message: "file that was send was not an image" });
            }
        }
        const { id } = request.params;
        const profile_picture = request.file!.path;
        try {
            const user = await UserModel.findById(id);
            const old_profile_picture = user!.profile_picture;
            user!.profile_picture = profile_picture;
            await user!.save({ validateModifiedOnly: true });
            if (old_profile_picture !== default_profile_picture) {
                await unlink(old_profile_picture);
            }
            const userObject = user?.toObject()!;
            return response.status(200).json(
                Object.assign(userObject, {
                    profile_picture: relativizePicturePath(profile_picture),
                    relative_profile_picture: undefined,
                })
            );
        } catch (err) {
            next(err);
        }
    }

    public static async delete_avatar(request: Request, response: Response, next: NextFunction) {
        const { id } = request.params;
        try {
            const user = await UserModel.findById(id);
            const old_profile_picture = user!.profile_picture;
            user!.profile_picture = default_profile_picture;
            await user!.save({ validateModifiedOnly: true });
            if (old_profile_picture !== default_profile_picture) {
                await unlink(old_profile_picture);
            }
            const userObject = user?.toObject()!;
            return response.status(200).json(
                Object.assign(userObject, {
                    profile_picture: relativizePicturePath(default_profile_picture),
                    relative_profile_picture: undefined,
                })
            );
        } catch (err) {
            next(err);
        }
    }
}
