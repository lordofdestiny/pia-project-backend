import { Router } from "express";
import DoctorController from "@controllers/doctor.controller";
import { Authenticator } from "@utils/authenticate";
import { EUserRole } from "@models/user.model";

const DoctorRouter = Router();

DoctorRouter.get("/", DoctorController.get_all);
DoctorRouter.get(
    "/:id",
    Authenticator.authenticate([EUserRole.PATIENT, EUserRole.DOCTOR, EUserRole.MANAGER]),
    DoctorController.get_by_id
);

export default DoctorRouter;
