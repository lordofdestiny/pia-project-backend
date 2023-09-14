import { Request, Response, NextFunction } from "express";
import { PatientModel, IPatient } from "@models/patient.model";
import { default_profile_picture } from "@utils/util";
import { ObjectId } from "mongodb";

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

    public static async get_all(_request: Request, response: Response, next: NextFunction) {
        try {
            const patients = await PatientModel.find(
                { status: { $ne: "deleted" } },
                {
                    password: 0,
                    salt: 0,
                    __v: 0,
                }
            ).lean({ virtuals: true });
            const resolved_patients = patients.map((patient) => {
                patient.profile_picture = patient.relative_profile_picture;
                (<any>patient).relative_profile_picture = undefined;
                return patient;
            });
            response.status(200).json(resolved_patients);
        } catch (err) {
            next(err);
        }
    }

    public static async get_notifications(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const { id } = request.params;
            const patient = await PatientModel.findById(id, {
                notifications: 1,
            })
                .populate({
                    path: "notifications.notification",
                })
                .lean({ virtuals: true });
            response.status(200).json(patient?.notifications ?? []);
        } catch (err) {
            next(err);
        }
    }

    public static async mark_as_seen(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const { id } = request.params;
            if (!ObjectId.isValid(id)) {
                return response.status(400).json({ message: "invalid id" });
            }
            const patient = await PatientModel.findByIdAndUpdate(id, {
                $set: {
                    "notifications.$[].seen": true,
                },
            });
            response.sendStatus(204);
        } catch (err) {}
    }
}
