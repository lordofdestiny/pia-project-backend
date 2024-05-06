import { Schema, Types, model } from "mongoose";
import {  IAppointment } from "./appointment.model";

export type TPatientNotification = {
    message: string;
    date: Date;
} & (
    | {
          start: Date;
          end: Date;
          type: "promotion";
      }
    | {
          type: "cancellation";
      }
    | {
          appointment: Types.ObjectId | IAppointment;
          type: "appointment";
      }
);

const NotificationSchema = new Schema<TPatientNotification>({
    message: {
        type: String,
        trim: true,
        required: [true, "Message is required"],
    },
    date: {
        type: Date,
        default: () => new Date(),
    },
    start: {
        type: Date,
    },
    end: {
        type: Date,
    },
    appointment: {
        type: Types.ObjectId,
        ref: "Appointments",
    },
    type: {
        type: String,
        enum: ["promotion", "cancellation", "appointment"],
        required: [true, "Type is required"],
    },
});

export const NotificationModel = model("Notifications", NotificationSchema, "notifications");
