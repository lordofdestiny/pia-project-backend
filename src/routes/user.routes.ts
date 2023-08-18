import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import PatientRouter from "./patient.routes";
import DoctorRouter from "./doctor.routes";
import passport from "passport";
import { Authenticator } from "../utils/authenticate";
import { EUserRole } from "../models/user";
import AuthRouter from "./auth.routes";
import ManagerRouter from "./manager.routes";

const userRouter = Router();

// Import routers
userRouter.use("/patient", Authenticator.authenticate([EUserRole.PATIENT]), PatientRouter);
userRouter.use("/doctor", Authenticator.authenticate([EUserRole.DOCTOR]), DoctorRouter);
userRouter.use("/manager", Authenticator.authenticate([EUserRole.MANAGER]), ManagerRouter);

export default userRouter;
