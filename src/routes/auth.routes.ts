import express, { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { EUserRole } from "../models/user";
import { Authenticator } from "../utils/authenticate";

const AuthRouter = Router();

// Common routes
AuthRouter.post("/register", AuthController.register);
AuthRouter.post("/login", AuthController.login);
AuthRouter.post("/logout", AuthController.logout);
AuthRouter.post(
    "/change-password",
    Authenticator.authenticate([EUserRole.USER]),
    AuthController.changePassword
);

export default AuthRouter;
