import express, { Router } from "express";
import path from "path";
import PatientRouter from "./patient.routes";
import DoctorRouter from "./doctor.routes";
import { Authenticator } from "../utils/authenticate";
import { EUserRole } from "../models/user";
import ManagerRouter from "./manager.routes";

const UserRouter = Router();

// Import routers
UserRouter.use("/patient", PatientRouter);
UserRouter.use("/doctor", DoctorRouter);
UserRouter.use("/manager", ManagerRouter);

export default UserRouter;
