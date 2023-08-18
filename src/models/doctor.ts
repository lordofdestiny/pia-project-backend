import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "./user";

export interface IDoctor extends IUser {
    licence_number: string;
    specialization: string;
    branch: string;
}

interface IDoctorMethods extends IUserMethods {}

type TDoctorModel = Model<IDoctor, {}, IDoctorMethods>;

const doctorSchema = new Schema<IDoctor, TDoctorModel, IDoctorMethods>(
    {
        licence_number: {
            type: String,
            required: [true, "Licence number is required"],
        },
        specialization: {
            type: String,
            required: [true, "Specialization is required"],
        },
        branch: {
            type: String,
            required: [true, "Branch is required"],
        },
    },
    {
        discriminatorKey: "type",
    }
);

export const DoctorModel = UserModel.discriminator("Doctor", doctorSchema, EUserRole.DOCTOR);
