import express, { Router } from "express";
import PatientController from "../controllers/patient.controller";
import { serverErrorHandler } from "../utils/error-handler";

const patientRouter = Router();

patientRouter.route("/register").post(PatientController.register);

export default patientRouter;
