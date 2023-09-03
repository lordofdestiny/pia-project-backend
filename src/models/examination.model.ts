import { Schema, Types, model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

export type IExamination = {
    specialization: Types.ObjectId;
    name: string;
    duration: number;
    price: number;
    disabled: boolean;
};

export const examinationSchema = new Schema<IExamination>(
    {
        specialization: {
            type: Schema.Types.ObjectId,
            ref: "Specialization",
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
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    {
        toObject: {
            virtuals: true,
        },
    }
);
examinationSchema.plugin(mongooseLeanVirtuals);

export const ExaminationModel = model("Examination", examinationSchema, "examinations");
console.log("examination.model.ts");
