import { Schema, model } from "mongoose";

export interface IPatientNotification {
    message: string;
    start: Date;
    end: Date;
}

const NotificationSchemma = new Schema<IPatientNotification>({
    message: String,
    start: Date,
    end: Date,
});

export const NotificationModel = model("Notification", NotificationSchemma, "notifications");
