import { Router } from "express";
import DoctorController from "../controllers/doctor.controller";

const DoctorRouter = Router();

DoctorRouter.route("/register").post(DoctorController.register);

export default DoctorRouter;
