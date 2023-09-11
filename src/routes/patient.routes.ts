import PatientController from "@controllers/patient.controller";
import { Router } from "express";
import { upload } from "@utils/upload";

export const PatientRouter = Router();
PatientRouter.post("/", upload.single("profile_picture"), PatientController.register);
PatientRouter.get("/", PatientController.get_all);
