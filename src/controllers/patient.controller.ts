import {Request, Response, NextFunction} from "express";
import {PatientModel, IPatient} from "@models/patient.model";
import {default_profile_picture, relativizePicturePath} from "@utils/util";
import {ObjectId} from "mongodb";

export default class PatientController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        if (request.file === undefined && (request.file_not_image ?? false)) {
            return response.status(400).json({message: "file that was send was not an image"});
        }
        const {body: data} = request;
        const profile_picture =
            relativizePicturePath(request.file?.path) ?? default_profile_picture;
        try {
            const user = await PatientModel.create({...data, profile_picture});
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }

    public static async get_all(_request: Request, response: Response, next: NextFunction) {
        try {
            const patients = await PatientModel.find(
                {status: {$ne: "deleted"}},
                {
                    password: 0,
                    salt: 0,
                    __v: 0,
                }
            ).lean({virtuals: true});
            response.status(200).json(patients);
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
            const {id} = request.params;
            const patient = await PatientModel.findById(id, {
                    notifications: 1,
                })
                .populate({
                    path: "notifications",
                    populate: {path: "notification",},
                })
                .lean({virtuals: true});
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
            const {id} = request.params;
            if (!ObjectId.isValid(id)) {
                return response.status(400).json({message: "invalid id"});
            }
            const patient = await PatientModel.findById(id).populate({
                path: "notifications",
                populate: {path: "notification",},
            });
            if (!patient) {
                return response.status(404).json({message: "patient not found"});
            }
            patient.notifications.forEach((notification) => {
                if (notification.notification.date.getTime() <= Date.now() && !notification.seen) {
                    notification.seen = true;
                }
            });
            await patient.save({
                validateModifiedOnly: true,
                validateBeforeSave: false,
            });
            response.status(200).json(patient.notifications);
        } catch (err) {
            next(err);
        }
    }
}
