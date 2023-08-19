import express, { Router } from "express";
import path from "path";
import PatientRouter from "@routes/patient.routes";
import DoctorRouter from "@routes/doctor.routes";
import ManagerRouter from "@routes/manager.routes";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user";

const UserRouter = Router();

// Import routers
UserRouter.use("/patient", PatientRouter);
UserRouter.use("/doctor", DoctorRouter);
UserRouter.use("/manager", ManagerRouter);

export default UserRouter;
