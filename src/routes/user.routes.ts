import { Router } from "express";
import UserController from "../controllers/user.controller";
import PatientRouter from "./patient.routes";
import DoctorRouter from "./doctor.routes";

const userRouter = Router();

// Import routers
userRouter.use("/patient", PatientRouter);
userRouter.use("/doctor", DoctorRouter);

// Common routes
userRouter.post("/register", UserController.register);
userRouter.post("/login", UserController.login);
userRouter.post("/logout", UserController.logout);

export default userRouter;
