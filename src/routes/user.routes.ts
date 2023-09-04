import express, { Router } from "express";
import path from "path";
import PatientRouter from "@routes/patient.routes";
import DoctorRouter from "@routes/doctor.routes";
import ManagerRouter from "@routes/manager.routes";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user.model";
import { upload } from "@utils/upload";
import UserController from "@controllers/user.controller";
import { disable } from "@middleware/disable_route";

const UserRouter = Router();

// Import routers
UserRouter.use("/patient", PatientRouter);
UserRouter.use("/doctor", DoctorRouter);
UserRouter.use("/manager", ManagerRouter);

UserRouter.get(
    "/user/profile",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    UserController.get_profile
);

UserRouter.put(
    "/profile/:id",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    UserController.update_profile
);

UserRouter.put(
    "/avatar/:id",
    upload.single("profile_picture"),
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    UserController.update_avatar
);

UserRouter.delete(
    "/avatar/:id",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    UserController.delete_avatar
);

export default UserRouter;
