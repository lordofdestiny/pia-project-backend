import { Router } from "express";
import PatientController from "../controllers/patient.controller";
import { Authenticator } from "../utils/authenticate";
import { EUserRole } from "../models/user";

const PatientRouter = Router();

PatientRouter.get(
    "/profile",
    Authenticator.authenticate([EUserRole.PATIENT]),
    PatientController.profile
);

export default PatientRouter;
