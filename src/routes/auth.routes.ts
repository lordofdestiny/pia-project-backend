import express, { Router } from "express";
import AuthController from "@controllers/auth.controller";
import { EUserRole, IUser } from "@models/user.model";
import { Authenticator } from "@utils/authenticate";
const AuthRouter = Router();

// Common routes
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
