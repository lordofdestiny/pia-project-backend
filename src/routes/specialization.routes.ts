import { Router } from "express";
import SpecializationController from "@controllers/specialization.controller";

const SpecializationRouter = Router();

SpecializationRouter.get("/all", SpecializationController.get_all);
SpecializationRouter.get("/", SpecializationController.get_specialization);
SpecializationRouter.post("/", SpecializationController.create);
SpecializationRouter.post("/:id/examination", SpecializationController.add_examination);

export default SpecializationRouter;
