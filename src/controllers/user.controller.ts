import { unlink } from "fs/promises";
import { Request, Response, NextFunction } from "express";
import { EUserRole, IUser, UserModel } from "@models/user.model";
import { relativizePicturePath } from "@utils/util";
import { default_profile_picture } from "@utils/util";
import path from "path";
import { DoctorModel, IDoctor } from "@models/doctor.model";
import { IManager, ManagerModel } from "@models/manager.model";
import { IPatient, PatientModel } from "@models/patient.model";
import { Query, QueryWithHelpers } from "mongoose";

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
        request: Request<
            { id: string },
            {},
            (Partial<IPatient> | Partial<IDoctor> | Partial<IManager>) & {
                type: EUserRole;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        if (request.isAuthenticated()) {
            return UserController.update_profile_session(request, response, next);
        }
        const { id } = request.params;
        const data = request.body;
        const { type } = data ?? {};
        if (type === undefined) {
            return response.status(400).json({ message: "type is required" });
        }
        console.log(data);
        try {
            const user = await (type === EUserRole.PATIENT
                ? UserController.updatePatientProfile(id, data as IPatient)
                : type === EUserRole.DOCTOR
                ? UserController.updateDoctorProfile(id, data as IDoctor)
                : UserController.updateManagerProfile(id, data as IManager)
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

    private static updatePatientProfile(id: string, data: IPatient): Query<any, any, {}, IPatient> {
        return PatientModel.findOneAndUpdate(
            { _id: id },
            {
                $set: data,
            },
            {
                new: true,
                runValidators: true,
                validateModifiedOnly: true,
            }
        );
    }
    private static updateDoctorProfile(id: string, data: IDoctor): Query<any, any, {}, IDoctor> {
        return DoctorModel.findOneAndUpdate(
            { _id: id },
            {
                $set: data,
            },
            {
                new: true,
                runValidators: true,
                validateModifiedOnly: true,
            }
        ).populate("specialization");
    }
    private static updateManagerProfile(id: string, data: IManager): Query<any, any, {}, IManager> {
        return ManagerModel.findOneAndUpdate(
            { _id: id },
            {
                $set: data,
            },
            {
                new: true,
                runValidators: true,
                validateModifiedOnly: true,
            }
        );
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
                return response.status(200).json(user.toObject());
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
