import { Router } from "express";
import PatientController from "../controllers/patient.controller";

const PatientRouter = Router();

PatientRouter.route("/register").post(PatientController.register);

export default PatientRouter;
