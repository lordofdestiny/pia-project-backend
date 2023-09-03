import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";

export interface IPatient extends IUser {
    approved: boolean;
}

interface IPatientMethods extends IUserMethods {}

type TPatientModel = Model<IPatient, {}, IPatientMethods>;

const parientSchema = new Schema<IPatient, TPatientModel, IPatientMethods>(
    {
        approved: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        discriminatorKey: "type",
        toObject: {
            virtuals: true,
        },
    }
);

export const PatientModel = UserModel.discriminator("Patient", parientSchema, EUserRole.PATIENT);
