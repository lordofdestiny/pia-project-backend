import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { DoctorModel, IDoctor } from "@models/doctor.model";
import { default_profile_picture, resolvePicturePath } from "@utils/util";
import { SpecializationModel } from "@models/specialization.model";
import { DateTime } from "luxon";

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

    public static async get_doctors(
        _request: Request<
            {},
            {},
            {},
            {
                id: string;
                username: string;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { query: userQuery } = _request;
        const query: any = {};
        if (userQuery.id) {
            query._id = new mongoose.Types.ObjectId(userQuery.id);
        }
        if (userQuery.username) {
            query.username = userQuery.username;
        }
        try {
            const doctors = await DoctorModel.find(query)
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
                .lean({ virtuals: true });
            doctors.forEach((doctor) => {
                Object.assign(doctor, {
                    profile_picture: doctor.relative_profile_picture,
                    relative_profile_picture: undefined,
                });
            });
            return response.status(200).json(doctors);
        } catch (err) {
            next(err);
        }
    }

    public static async update_examinations(
        request: Request<
            { id: string },
            {},
            {
                examinationIds: string[];
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { id } = request.params;
        const { examinationIds } = request.body;
        try {
            const doctor = await DoctorModel.findByIdAndUpdate(
                id,
                {
                    $set: { examinations: examinationIds },
                },
                {
                    new: true,
                }
            )
                .populate({
                    path: "examinations",
                    match: {
                        staus: "active",
                    },
                })
                .lean({ virtuals: true });
            if (doctor == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            return response.status(200).json({
                examinations: doctor.examinations,
            });
        } catch (err) {
            next(err);
        }
    }

    public static async add_vacation(
        request: Request<{ id: string }, any, { start_date: string; end_date: string }>,
        response: Response,
        next: NextFunction
    ) {
        const { id } = request.params;
        const { start_date, end_date } = request.body;
        try {
            const doctor = await DoctorModel.findById(id);
            if (doctor == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            const vacation = {
                start_date: DateTime.fromISO(start_date).toJSDate(),
                end_date: DateTime.fromISO(end_date).toJSDate(),
            };
            const vacations = DoctorController.join_vacaions([...doctor.vacations, vacation]);
            doctor.vacations = vacations;
            await doctor.save({
                validateModifiedOnly: true,
            });
            const vacations_to_send = vacations.map(({ start_date, end_date }) => {
                return {
                    start_date: DateTime.fromJSDate(start_date).toISODate(),
                    end_date: DateTime.fromJSDate(end_date).toISODate(),
                };
            });
            return response
                .status(200)
                .json({ message: "vacation added", vacations: vacations_to_send });
        } catch (err) {
            next(err);
        }
    }

    private static join_vacaions(vacations: IDateRange[]): IDateRange[] {
        vacations.sort(({ start_date: a }, { end_date: b }) => (a < b ? -1 : 1));
        const result: IDateRange[] = [];
        let [{ start_date: x1, end_date: x2 }, ...rest] = vacations;
        for (const { start_date: y1, end_date: y2 } of rest) {
            if (y1 >= x2) {
                result.push({ start_date: x1, end_date: x2 });
                [x1, x2] = [y1, y2];
                continue;
            }
            if (x2 <= y2) {
                x2 = y2;
            }
        }
        result.push({ start_date: x1, end_date: x2 });
        return result;
    }
}

interface IDateRange {
    start_date: Date;
    end_date: Date;
}
