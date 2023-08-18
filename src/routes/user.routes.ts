import express, { Router } from "express";
import path from "path";
import PatientRouter from "./patient.routes";
import DoctorRouter from "./doctor.routes";
import { Authenticator } from "../utils/authenticate";
import { EUserRole } from "../models/user";
import ManagerRouter from "./manager.routes";

const UserRouter = Router();

// Import routers
UserRouter.use("/patient", Authenticator.authenticate([EUserRole.PATIENT]), PatientRouter);
UserRouter.use("/doctor", Authenticator.authenticate([EUserRole.DOCTOR]), DoctorRouter);
UserRouter.use("/manager", Authenticator.authenticate([EUserRole.MANAGER]), ManagerRouter);

export default UserRouter;
