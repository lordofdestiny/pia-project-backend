import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";
import { IPatientNotification } from "./promotion.model";

export enum EPatientStatus {
    CREATED = "created",
    ACTIVE = "active",
    DELETED = "deleted",
}

export interface IPatient extends IUser {
    status: EPatientStatus;
    notifications: { notification: IPatientNotification; seen: boolean }[];
}

interface IPatientMethods extends IUserMethods {}

type TPatientModel = Model<IPatient, {}, IPatientMethods>;

const ParientSchema = new Schema<IPatient, TPatientModel, IPatientMethods>(
    {
        status: {
            type: String,
            required: true,
            default: EPatientStatus.CREATED,
            enum: Object.values(EPatientStatus),
        },
        notifications: [
            {
                notification: {
                    type: Schema.Types.ObjectId,
                    ref: "Notification",
                },
                seen: {
                    type: Boolean,
                    default: false,
                },
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

export const PatientModel = UserModel.discriminator("Patient", ParientSchema, EUserRole.PATIENT);
