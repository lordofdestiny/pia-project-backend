import multer from "multer";
import { Router } from "express";
import PatientController from "@controllers/patient.controller";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user";
import { upload } from "@utils/upload";

const PatientRouter = Router();

PatientRouter.get(
    "/profile",
    Authenticator.authenticate([EUserRole.PATIENT]),
    PatientController.get_profile
);

// TODO: CHECK IF IT IS NECESSARY
PatientRouter.get(
    "/avatar",
    Authenticator.authenticate([EUserRole.PATIENT]),
    PatientController.get_avatar
);

PatientRouter.patch(
    "/profile",
    Authenticator.authenticate([EUserRole.PATIENT]),
    PatientController.update_profile
);

PatientRouter.patch(
    "/avatar",
    upload.single("profile_picture"),
    Authenticator.authenticate([EUserRole.PATIENT]),
    PatientController.update_avatar
);

export default PatientRouter;
