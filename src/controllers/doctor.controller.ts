import { Request, Response, NextFunction } from "express";
import mongoose, { ClientSession, Types } from "mongoose";

import { DoctorModel, IDoctor } from "@models/doctor.model";
import { default_profile_picture } from "@utils/util";
import { SpecializationModel } from "@models/specialization.model";
import { ExaminationModel } from "@models/examination.model";

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
                .populate({
                    path: "examination_requests",
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
                .populate({
                    path: "examination_requests",
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

    public static async update_examinations(
        request: Request<
            { id: string },
            {
                offered: string[];
                requested: string[];
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { id } = request.params;
        const { offered, requested } = request.body;
        try {
            const doctor = await DoctorModel.findByIdAndUpdate(
                id,
                {
                    examitions: offered.map(mongoose.Types.ObjectId),
                    examination_requests: requested.map(mongoose.Types.ObjectId),
                },
                {
                    new: true,
                    runValidators: false,
                }
            )
                .populate("specialization", "name")
                .populate({
                    path: "examinations",
                    match: {
                        disabled: false,
                    },
                })
                .populate({
                    path: "examination_requests",
                    match: {
                        disabled: false,
                    },
                })
                .lean({ virtuals: true });
            if (doctor == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            return response.status(200).json(
                Object.assign(doctor, {
                    profile_picture: doctor.relative_profile_picture,
                    relative_profile_picture: undefined,
                })
            );
        } catch (err) {
            next(err);
        }
    }

    public static async respond_to_examination_request(
        request: Request<
            {
                id: string;
            },
            {
                examinationID: string;
                action: boolean;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { id: doctorId } = request.params;
        const { examinationId, action } = request.body;

        try {
            const doctor = await DoctorModel.findById(doctorId);
            if (doctor == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            const examination = await ExaminationModel.findById(examinationId);
            if (examination == null) {
                return response.status(404).json({ message: "examination not found" });
            }

            const objExamId = new Types.ObjectId(examinationId);
            const update = {
                $pull: {
                    examination_requests: objExamId,
                },
            };
            if (action) {
                Object.assign(update, {
                    $push: {
                        examinations: objExamId,
                    },
                });
            }

            await doctor.updateOne(update);
            return response.status(200).json({ message: "success" });
        } catch (err) {
            next(err);
        }
    }
}
