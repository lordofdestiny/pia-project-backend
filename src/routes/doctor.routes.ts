import { Router } from "express";
import DoctorController from "@controllers/doctor.controller";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user.model";
import { upload } from "@utils/upload";

const DoctorRouter = Router();
DoctorRouter.post(
    "/",
    Authenticator.authenticate([EUserRole.MANAGER]),
    upload.single("profile_picture"),
    DoctorController.register
);

DoctorRouter.get("/", DoctorController.get_all);
DoctorRouter.get(
    "/:username",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    DoctorController.get_by_username
);

export default DoctorRouter;
