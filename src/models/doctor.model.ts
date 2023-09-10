import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";
import { ISpecialization } from "./specialization.model";

export interface IDoctor extends IUser {
    licence_number: string;
    specialization: ISpecialization;
    examinations: string[];
    branch: string;
    vacations: {
        start_date: Date;
        end_date: Date;
    }[];
}
interface IDoctorMethods extends IUserMethods {}

type TDoctorModel = Model<IDoctor, {}, IDoctorMethods>;

const DoctorSchema = new Schema<IDoctor, TDoctorModel, IDoctorMethods>(
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
        branch: {
            type: String,
            trim: true,
            required: [true, "Branch is required"],
        },
        examinations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Examination",
            },
        ],
        vacations: [
            {
                start_date: Date,
                end_date: Date,
            },
        ],
    },
    {
        discriminatorKey: "type",
        toObject: {
            virtuals: true,
        },
    }
);

export const DoctorModel = UserModel.discriminator("Doctor", DoctorSchema, EUserRole.DOCTOR);
