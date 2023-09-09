import { Router } from "express";
import PatientRouter from "@routes/patient.routes";
import DoctorRouter from "@routes/doctor.routes";
import ManagerRouter from "@routes/manager.routes";
import { EUserRole } from "@models/user.model";
import { upload } from "@utils/upload";
import { Authenticator } from "@utils/authenticate";
import UserController from "@controllers/user.controller";

const UserRouter = Router();

// Import routers
UserRouter.use("/patients", PatientRouter);
UserRouter.use("/doctors", DoctorRouter);
UserRouter.use("/managers", ManagerRouter);

UserRouter.put(
    "/profile/:id",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    UserController.update_profile
);

UserRouter.delete(
    "/profile/:id",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    UserController.delete_profile
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
