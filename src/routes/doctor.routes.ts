import { Router } from "express";
import DoctorController from "../controllers/doctor.controller";

const DoctorRouter = Router();

DoctorRouter.get("/", DoctorController.get_all);
DoctorRouter.get("/:id", DoctorController.get_by_id);

export default DoctorRouter;
