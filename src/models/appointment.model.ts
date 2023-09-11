import { Schema, Types, model } from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import { IDoctor } from "./doctor.model";
import { IPatient } from "./patient.model";
import { IExamination } from "./examination.model";

export type IAppointmentReport = {
    reason: string;
    diagnosis: string;
    therapy: string;
    followup: Date;
};

export enum EAppointmentStatus {
    UPCOMING = "upcoming",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
}

export type IAppointment = {
    id: string;
    doctor: Types.ObjectId | IDoctor;
    patient: Types.ObjectId | IPatient;
    examination: Types.ObjectId | IExamination;
    datetime: Date;
    status: EAppointmentStatus;
    cancelled_explanation?: string;
    report: IAppointmentReport | null;
};

export const AppointmentSchema = new Schema<IAppointment>(
    {
        doctor: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
            required: [true, "Doctor is required"],
        },
        patient: {
            type: Schema.Types.ObjectId,
            ref: "Patient",
            required: [true, "Patient is required"],
        },
        examination: {
            type: Schema.Types.ObjectId,
            ref: "Examination",
            required: [true, "Examination is required"],
        },
        datetime: {
            type: Date,
            required: [true, "Date and time is required"],
        },
        status: {
            type: String,
            trim: true,
            required: true,
            enum: Object.values(EAppointmentStatus),
            default: EAppointmentStatus.UPCOMING,
        },
        cancelled_explanation: String,
        report: {
            type: {
                reason: {
                    type: String,
                    trim: true,
                    required: [true, "Reason is required"],
                },
                diagnosis: {
                    type: String,
                    trim: true,
                    required: [true, "Diagnosis is required"],
                },
                therapy: {
                    type: String,
                    trim: true,
                    required: [true, "Therapy is required"],
                },
                followup: {
                    type: Date,
                    required: [true, "Next appointment is required"],
                },
            },
            default: null,
        },
    },
    {
        autoCreate: false,
        toObject: {
            virtuals: true,
        },
    }
);
AppointmentSchema.plugin(mongooseLeanVirtuals);
export const AppointmentModel = model("Appointment", AppointmentSchema, "appointments");
