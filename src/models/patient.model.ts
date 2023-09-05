import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";

enum EPatientStatus {
    CREATED = "created",
    ACTIVE = "active",
    DELETED = "deleted",
}

export interface IPatient extends IUser {
    status: EPatientStatus;
}

interface IPatientMethods extends IUserMethods {}

type TPatientModel = Model<IPatient, {}, IPatientMethods>;

const parientSchema = new Schema<IPatient, TPatientModel, IPatientMethods>(
    {
        status: {
            type: String,
            required: true,
            default: EPatientStatus.CREATED,
            enum: Object.values(EPatientStatus),
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
