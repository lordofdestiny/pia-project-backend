import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

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
            trim: true,
            required: [true, "Licence number is required"],
        },
        specialization: {
            type: String,
            trim: true,
            required: [true, "Specialization is required"],
        },
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
