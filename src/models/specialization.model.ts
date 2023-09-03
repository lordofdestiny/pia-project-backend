import { Schema, Model, model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { ExaminationModel, IExamination } from "./examination.model";

export interface ISpecialization {
    name: string;
    examinations: IExamination[];
}

interface ISpecializationMethods {}

type TSpecializationModel = Model<ISpecialization, {}, ISpecializationMethods>;

const specializationSchema = new Schema<
    ISpecialization,
    TSpecializationModel,
    ISpecializationMethods
>(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "name is required"],
        },
        examinations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Examination",
            },
        ],
    },
    {
        toObject: {
            virtuals: true,
        },
    }
);
specializationSchema.plugin(mongooseLeanVirtuals);

export const SpecializationModel = model("Specialization", specializationSchema, "specializations");
console.log("specialization.model.ts");
