import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "./user";

export interface IPatient extends IUser {}

interface IPatientMethods extends IUserMethods {}

type TPatientModel = Model<IPatient, {}, IPatientMethods>;

const parientSchema = new Schema<IPatient, TPatientModel, IPatientMethods>(
    {},
    {
        discriminatorKey: "type",
    }
);

export const PatientModel = UserModel.discriminator("Patient", parientSchema, EUserRole.PATIENT);
