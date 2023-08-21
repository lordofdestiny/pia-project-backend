import { Router } from "express";
import DoctorController from "@controllers/doctor.controller";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user";

const DoctorRouter = Router();

DoctorRouter.get("/", DoctorController.get_all);
DoctorRouter.get(
    "/:username",
    Authenticator.authenticate([EUserRole.USER]),
    DoctorController.get_by_id
);

export default DoctorRouter;
