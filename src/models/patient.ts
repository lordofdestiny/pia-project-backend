import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user";

export interface IPatient extends IUser {}

interface IPatientMethods extends IUserMethods {}

type TPatientModel = Model<IPatient, {}, IPatientMethods>;

const parientSchema = new Schema<IPatient, TPatientModel, IPatientMethods>(
    {},
    {
        discriminatorKey: "type",
        toObject: {
            virtuals: true,
        },
    }
);

export const PatientModel = UserModel.discriminator("Patient", parientSchema, EUserRole.PATIENT);
