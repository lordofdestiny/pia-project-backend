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

DoctorRouter.put(
    "/:id/examinations",
    Authenticator.authenticate([EUserRole.DOCTOR]),
    DoctorController.update_examinations
);

DoctorRouter.post(
    "/:id/examinations/response",
    Authenticator.authenticate([EUserRole.MANAGER]),
    DoctorController.respond_to_examination_request
);

export default DoctorRouter;
