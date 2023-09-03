import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";
import { ISpecialization } from "./specialization.model";
import { IExamination, ExaminationModel } from "./examination.model";
ExaminationModel;

export interface IDoctor extends IUser {
    licence_number: string;
    specialization: ISpecialization;
    examinations: IExamination[];
    branch: string;
}

interface IDoctorMethods extends IUserMethods {}

type TDoctorModel = Model<IDoctor, {}, IDoctorMethods>;

const doctorSchema = new Schema<IDoctor, TDoctorModel, IDoctorMethods>(
    {
        licence_number: {
            type: String,
            trim: true,
            required: [true, "Licence number is required"],
        },
        specialization: {
            type: Schema.Types.ObjectId,
            ref: "Specialization",
            required: [true, "Specialization is required"],
        },
        examinations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Examination",
            },
        ],
        branch: {
            type: String,
            trim: true,
            required: [true, "Branch is required"],
        },
    },
    {
        discriminatorKey: "type",
        toObject: {
            virtuals: true,
        },
    }
);

export const DoctorModel = UserModel.discriminator("Doctor", doctorSchema, EUserRole.DOCTOR);
