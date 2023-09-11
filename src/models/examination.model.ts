import { Schema, SchemaType, Types, model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

export enum ExaminationStatus {
    REQUESTED = "requested",
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export type IExamination = {
    id: string | Types.ObjectId;
    specialization: Types.ObjectId;
    name: string;
    duration: number;
    price: number;
    status: ExaminationStatus;
};

export const ExaminationSchema = new Schema<IExamination>(
    {
        specialization: {
            type: Schema.Types.ObjectId,
            ref: "Specialization",
            required: [true, "Specialization is required"],
        },
        name: {
            type: String,
            trim: true,
            required: [true, "Name is required"],
        },
        duration: {
            type: Number,
            default: 30,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
        },
        status: {
            type: String,
            trim: true,
            required: true,
            enum: Object.values(ExaminationStatus),
            default: ExaminationStatus.ACTIVE,
        },
    },
    {
        autoCreate: false,
        toObject: {
            virtuals: true,
        },
    }
);
ExaminationSchema.plugin(mongooseLeanVirtuals);
export const ExaminationModel = model("Examination", ExaminationSchema, "examinations");
