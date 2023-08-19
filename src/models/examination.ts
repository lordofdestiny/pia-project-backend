import { Schema, Model, model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user";

export interface IExamination extends IUser {
    specializations_id: IExamination;
    name: string;
    duration: number;
    price: number;
    disabled: boolean;
}

interface IExaminationMethods extends IUserMethods {}

type TExaminationModel = Model<IExamination, {}, IExaminationMethods>;

const managerSchema = new Schema<IExamination, TExaminationModel, IExaminationMethods>({
    specializations_id: {
        type: [Schema.Types.ObjectId],
        ref: "Specialization",
        required: [true, "specializations_id is required"],
    },
    name: {
        type: String,
        required: [true, "name is required"],
    },
    duration: {
        type: Number,
        default: 30,
    },
    price: {
        type: Number,
        required: [true, "price is required"],
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

export const ExaminationModel = model("Examination", managerSchema, "examinations");
