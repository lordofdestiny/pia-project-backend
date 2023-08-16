import { IUser } from "../models/user";
import { IPatient } from "../models/patient";
import { IDoctor } from "../models/doctor";
import { IManager } from "../models/manager";

declare module "express-serve-static-core" {
    export interface Request {
        user: IUser;
        patient: IPatient;
        doctor: IDoctor;
        manager: IManager;
    }
}
