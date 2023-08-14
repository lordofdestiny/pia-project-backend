import { Schema, Model } from "mongoose";
import User, { IUser } from "./user";

export interface IPatient extends IUser {}

interface IPatientMethods {
    // comparePassword: (password: string) => Promise<boolean>;
}

type PatientModel = Model<IPatient, {}, IPatientMethods>;

const parientSchema = new Schema<IPatient, PatientModel, IPatientMethods>(
    {},
    {
        discriminatorKey: "type",
    }
);

export default User.discriminator("Patient", parientSchema, "Patient");
