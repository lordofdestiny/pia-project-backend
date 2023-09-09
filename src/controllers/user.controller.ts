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
        const { id } = request.params;
        const data = request.body;
        const { type } = data ?? {};
        if (type === undefined) {
            return response.status(400).json({ message: "type is required" });
        }
        try {
            if ((<any>data).specialization) {
                (<any>data).examinations = [];
            }
            const args = [
                { _id: id },
                {
                    $set: data,
                },
                {
                    new: true,
                    runValidators: true,
                    validateModifiedOnly: true,
                },
            ];
            const user = await (type === EUserRole.PATIENT
                ? UserController.updatePatientProfile(...args)
                : type === EUserRole.DOCTOR
                ? UserController.updateDoctorProfile(...args)
                : UserController.updateManagerProfile(...args)
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

    private static updatePatientProfile(...args): Query<any, any, {}, IPatient> {
        return PatientModel.findOneAndUpdate(...args).select({
            __v: 0,
            password: 0,
            salt: 0,
        });
    }
    private static updateDoctorProfile(...args): Query<any, any, {}, IDoctor> {
        if (args[0].specialization) {
            args[0].examinations = [];
        }
        return DoctorModel.findOneAndUpdate(...args)
            .populate({
                path: "specialization",
                populate: {
                    path: "examinations",
                    match: {
                        status: "active",
                    },
                },
            })
            .populate({
                path: "examinations",
                match: {
                    status: "active",
                },
            })
            .select({
                __v: 0,
                password: 0,
                salt: 0,
            });
    }
    private static updateManagerProfile(...args): Query<any, any, {}, IManager> {
        return ManagerModel.findOneAndUpdate(...args).select({
            __v: 0,
            password: 0,
            salt: 0,
        });
    }

    public static async update_avatar(
        request: Request<{
            id: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        if (request.file === undefined) {
            if (request.file_not_image == undefined) {
                return response.status(400).json({ message: "no file was sent" });
            } else if (request.file_not_image) {
                return response
                    .status(400)
                    .json({ message: "file that was send was not an image" });
            }
        }
        UserController.impl_update_profile_picture(request.file!.path, request, response, next);
    }

    public static async delete_avatar(
        request: Request<{
            id: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        UserController.impl_update_profile_picture(
            default_profile_picture,
            request,
            response,
            next
        );
    }

    private static async impl_update_profile_picture(
        profile_picture,
        request: Request<{
            id: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const { id } = request.params;
            const user = await UserModel.findById(id);
            const old_profile_picture = user!.profile_picture;
            user!.profile_picture = profile_picture;
            await user!.save({ validateModifiedOnly: true });
            if (old_profile_picture !== default_profile_picture) {
                await unlink(old_profile_picture);
            }
            return response
                .status(200)
                .json({ profile_picture: relativizePicturePath(profile_picture) });
        } catch (err) {
            next(err);
        }
    }

    public static async delete_profile(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        const { id } = request.params;
        try {
            const user = await UserModel.findById(id);
            const old_profile_picture = user!.profile_picture;
            await user!.delete();
            if (old_profile_picture !== default_profile_picture) {
                await unlink(old_profile_picture);
            }
            return response.status(200).json({ message: "user deleted" });
        } catch (err) {
            next(err);
        }
    }
}
