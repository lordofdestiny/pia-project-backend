import { Request, Response, NextFunction } from "express";
import { default_profile_picture } from "@utils/util";
import { ManagerModel } from "@models/manager.model";
import { PatientModel } from "@models/patient.model";
import { DateTime } from "luxon";
import { NotificationModel } from "@models/notification.model";

export default class ManagerController {
    public static async register(request: Request, response: Response, next: NextFunction) {
        const { body: data } = request;
        try {
            const user = await ManagerModel.create({
                ...data,
                profile_picture: default_profile_picture,
            });
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }

    public static async create_notification(
        request: Request<
            {},
            {
                message: string;
                start: string;
                end: string;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { message, start, end } = request.body;
        if (!message || !start || !end) {
            return response.status(400).json({ message: "missing fields" });
        }

        try {
            const notification = await NotificationModel.create({
                message: message.trim(),
                start: DateTime.fromISO(start).startOf("day").toJSDate(),
                end: DateTime.fromISO(end).endOf("day").toJSDate(),
            });

            await PatientModel.updateMany(
                { status: "active" },
                {
                    $push: {
                        notifications: {
                            notification: notification._id,
                            seen: false,
                        },
                    },
                }
            );
            response.status(200).json(notification.toObject({ virtuals: true }));
        } catch (err) {
            next(err);
        }
    }
}
