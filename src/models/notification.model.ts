import { Schema, model } from "mongoose";

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
          type: "cancelation";
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
    type: {
        type: String,
        enum: ["promotion", "cancelation"],
        required: [true, "Type is required"],
    },
});

export const NotificationModel = model("Notifications", NotificationSchema, "notifications");
