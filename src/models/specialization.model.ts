import { ObjectId } from "mongodb";
import { Schema, Model, model, Types } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

export interface ISpecialization {
    id: string;
    name: string;
    examinations: ObjectId[];
}

interface ISpecializationMethods {}

type TSpecializationModel = Model<ISpecialization, {}, ISpecializationMethods>;

const SpecializationSchema = new Schema<
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
        autoCreate: false,
        toObject: {
            virtuals: true,
        },
    }
);
SpecializationSchema.plugin(mongooseLeanVirtuals);

export const SpecializationModel = model("Specialization", SpecializationSchema, "specializations");
console.log("specialization.model.ts");
