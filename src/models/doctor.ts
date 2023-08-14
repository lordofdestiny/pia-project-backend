import { Schema, Model } from "mongoose";
import User, { IUser } from "./user";

export interface IDoctor extends IUser {
    licence_number: string;
    specialization: string;
    branch: string;
}

interface IDoctorMethods {}

type DoctorModel = Model<IDoctor, {}, IDoctorMethods>;

const doctorSchema = new Schema<IDoctor, DoctorModel, IDoctorMethods>(
    {
        licence_number: {
            type: String,
            required: [true, "Licence number is required"],
        },
        specialization: {
            type: String,
            required: [true, "Specialization is required"],
        },
        branch: {
            type: String,
            required: [true, "Branch is required"],
        },
    },
    {
        discriminatorKey: "type",
    }
);

export default User.discriminator("Doctor", doctorSchema, "Doctor");
