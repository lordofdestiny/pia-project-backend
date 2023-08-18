import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "./user";

export interface IPatient extends IUser {}

interface IPatientMethods extends IUserMethods {}

type PatientModel = Model<IPatient, {}, IPatientMethods>;

const parientSchema = new Schema<IPatient, PatientModel, IPatientMethods>(
    {},
    {
        discriminatorKey: "type",
    }
);

export default UserModel.discriminator("Patient", parientSchema, EUserRole.PATIENT);
