import { Schema, Model, model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

export type IExamination = {
    duration: number;
    price: number;
    disabled: boolean;
};

export interface ISpecialization {
    name: string;
    examinations: IExamination[];
}

interface ISpecializationMethods extends IUserMethods {}

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
