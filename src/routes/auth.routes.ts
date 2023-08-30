import express, { Router } from "express";
import AuthController from "@controllers/auth.controller";
import { EUserRole, IUser } from "@models/user";
import { Authenticator } from "@utils/authenticate";
import PatientController from "@controllers/patient.controller";
import DoctorController from "@controllers/doctor.controller";
import { upload } from "@utils/upload";

const AuthRouter = Router();

// Common routes
AuthRouter.post("/register/patient", upload.single("profile_picture"), PatientController.register);
AuthRouter.post(
    "/register/doctor",
    Authenticator.authenticate([EUserRole.MANAGER]),
    upload.single("profile_picture"),
    DoctorController.register
);

AuthRouter.post("/login", AuthController.login_default);
AuthRouter.post("/login/manager", AuthController.login_manager);

AuthRouter.post(
    "/logout",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    AuthController.logout
);
AuthRouter.post(
    "/password",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    AuthController.changePassword
);
AuthRouter.post("/unique", AuthController.uniqueCredential);

export default AuthRouter;
