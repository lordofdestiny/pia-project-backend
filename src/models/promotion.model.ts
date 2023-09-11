import { Schema, model } from "mongoose";

export interface IPatientNotification {
    message: string;
    start: Date;
    end: Date;
}

const PromotionSchema = new Schema<IPatientNotification>({
    message: {
        type: String,
        trim: true,
        required: [true, "Message is required"],
    },
    start: {
        type: Date,
        required: [true, "Start date is required"],
    },
    end: {
        type: Date,
        required: [true, "End date is required"],
    },
});

export const PromotionModel = model("Promotions", PromotionSchema, "promotions");
