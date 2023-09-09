import { Schema, model } from "mongoose";

export interface IPatientNotification {
    message: string;
    start: Date;
    end: Date;
}

const PromotionSchema = new Schema<IPatientNotification>({
    message: String,
    start: Date,
    end: Date,
});

export const PromotionModel = model("Promotions", PromotionSchema, "promotions");
