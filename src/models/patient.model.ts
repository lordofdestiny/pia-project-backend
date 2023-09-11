import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";
import { IPatientNotification } from "./promotion.model";
import { IAppointment } from "./appointment.model";

export enum EPatientStatus {
    CREATED = "created",
    ACTIVE = "active",
    DELETED = "deleted",
}

export interface IPatient extends IUser {
    status: EPatientStatus;
    notifications: { notification: IPatientNotification; seen: boolean }[];
    appointments: IAppointment[];
}

interface IPatientMethods extends IUserMethods {}

type TPatientModel = Model<IPatient, {}, IPatientMethods>;

const ParientSchema = new Schema<IPatient, TPatientModel, IPatientMethods>(
    {
        status: {
            type: String,
            trim: true,
            required: true,
            default: EPatientStatus.CREATED,
            enum: Object.values(EPatientStatus),
        },
        notifications: [
            {
                notification: {
                    type: Schema.Types.ObjectId,
                    ref: "Promotions",
                },
                seen: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        appointments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Appointment",
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
