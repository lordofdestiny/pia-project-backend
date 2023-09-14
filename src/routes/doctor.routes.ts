import { Router } from "express";
import DoctorController from "@controllers/doctor.controller";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user.model";
import { upload } from "@utils/upload";

export const DoctorRouter = Router();
DoctorRouter.post(
    "/",
    Authenticator.authenticate([EUserRole.MANAGER]),
    upload.single("profile_picture"),
    DoctorController.register
);

DoctorRouter.get("/", DoctorController.get_doctors);

DoctorRouter.put(
    "/:id/examinations",
    Authenticator.authenticate([EUserRole.DOCTOR]),
    DoctorController.update_examinations
);

DoctorRouter.put(
    "/:id/vacations",
    Authenticator.authenticate([EUserRole.DOCTOR]),
    DoctorController.add_vacation
);
