import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import PatientRouter from "./patient.routes";
import DoctorRouter from "./doctor.routes";
import passport from "passport";
import { Authenticator } from "../utils/authenticate";
import { EUserRole } from "../models/user";
import AuthRouter from "./auth.routes";

const userRouter = Router();

// Import routers
userRouter.use("/patient", PatientRouter);
userRouter.use("/doctor", DoctorRouter);

export default userRouter;
