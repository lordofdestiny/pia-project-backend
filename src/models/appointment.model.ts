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

type ReportPath =
    | {
          generated: false;
          path: null;
      }
    | {
          generated: true;
          path: string;
      };

export type IAppointment = {
    id: string;
    doctor: Types.ObjectId | IDoctor;
    patient: Types.ObjectId | IPatient;
    examination: Types.ObjectId | IExamination;
    datetime: Date;
    report: IAppointmentReport | null;
    reportPath: ReportPath;
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
        reportPath: {
            type: {
                generated: {
                    type: Boolean,
                    default: false,
                },
                path: {
                    type: String,
                    default: null,
                },
            },
            required: false,
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
