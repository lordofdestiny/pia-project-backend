import { Router } from "express";
import UserController from "../controllers/user.controller";
import PatientRouter from "./patient.routes";
import DoctorRouter from "./doctor.routes";

const userRouter = Router();

// Import routers
userRouter.use("/patient", PatientRouter);
userRouter.use("/doctor", DoctorRouter);

// Common routes
userRouter.post("/login", UserController.login);

export default userRouter;
