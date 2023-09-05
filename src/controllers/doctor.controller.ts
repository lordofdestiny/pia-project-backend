import { Request, Response, NextFunction } from "express";
import mongoose, { ClientSession } from "mongoose";

import { DoctorModel, IDoctor } from "@models/doctor.model";
import { default_profile_picture } from "@utils/util";
import { SpecializationModel } from "@models/specialization.model";

export default class DoctorController {
    public static async register(
        request: Request<{}, {}, Omit<IDoctor, "specialization"> & { specialization: string }>,
        response: Response,
        next: NextFunction
    ) {
        if (request.file === undefined && (request.file_not_image ?? false)) {
            return response.status(400).json({ message: "file that was send was not an image" });
        }
        const { body: data } = request;
        const profile_picture = request.file?.path ?? default_profile_picture;

        try {
            const specialization = await SpecializationModel.findById(data.specialization);
            if (specialization == null) {
                return response.status(400).json({ message: "specialization not found" });
            }
            const user = await DoctorModel.create({ ...data, profile_picture });
            const doctor = await DoctorModel.populate(user, {
                path: "specialization",
                select: "name",
            });
            response.status(201).json(
                Object.assign(doctor.toObject({ virtuals: true }), {
                    profile_picture: doctor.relative_profile_picture,
                    relative_profile_picture: undefined,
                })
            );
        } catch (err) {
            next(err);
        }
    }

    public static async get_all(
        _request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        const hide = {
            __v: 0,
            password: 0,
            salt: 0,
        };
        try {
            const data = await DoctorModel.find({}, hide)
                .populate({
                    path: "specialization",
                    select: "name",
                })
                .populate({
                    path: "examinations",
                    match: {
                        disabled: false,
                    },
                })
                .lean({
                    virtuals: true,
                });
            return response.status(200).json(
                data.map((doc) => ({
                    ...doc,
                    profile_picture: doc.relative_profile_picture,
                    relative_profile_picture: undefined,
                }))
            );
        } catch (err) {
            next(err);
        }
    }

    public static async get_by_username(
        request: Request<{ username: "string" }, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        const { username } = request.params;
        const hide = {
            __v: 0,
            password: 0,
            salt: 0,
        };
        try {
            const data = await DoctorModel.findOne({ username }, hide)
                .populate({
                    path: "specialization",
                    select: "name",
                })
                .populate({
                    path: "examinations",
                    match: {
                        disabled: false,
                    },
                })
                .lean({ virtuals: true });
            if (data == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            const profile_picture = data.relative_profile_picture;
            return response.status(200).json({
                ...data,
                profile_picture,
                relative_profile_picture: undefined,
            });
        } catch (err) {
            next(err);
        }
    }
}
