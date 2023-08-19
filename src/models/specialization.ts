import { Schema, Model, model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user";
import { ExaminationModel, IExamination } from "@models/examination";

export interface ISpecialization extends IUser {
    name: string;
    examinations: IExamination[];
}

interface ISpecializationMethods extends IUserMethods {}

type TSpecializationModel = Model<ISpecialization, {}, ISpecializationMethods>;

const managerSchema = new Schema<ISpecialization, TSpecializationModel, ISpecializationMethods>({
    name: {
        type: String,
        required: [true, "name is required"],
    },
    examinations: [
        {
            type: Schema.Types.ObjectId,
            ref: "Examination",
        },
    ],
});

export const SpecializationModel = model("Specialization", managerSchema, "specializations");
