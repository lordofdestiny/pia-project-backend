import express, { Router } from "express";
import { serverErrorHandler } from "../utils/error-handler";
import patientRouter from "./patient.routes";
import doctorRouter from "./doctor.routes";

const userRouter = Router();

userRouter.use("/patient", patientRouter);
userRouter.use("/doctor", doctorRouter);

export default userRouter;
