import express, { Router } from "express";
import DoctorController from "../controllers/doctor.controller";
import { serverErrorHandler } from "../middleware/error-handler";

const doctorRouter = Router();

doctorRouter.route("/register").post(DoctorController.register);

export default doctorRouter;
