import { Router } from "express";
import SpecializationController from "@controllers/specialization.controller";

const SpecializationRouter = Router();

SpecializationRouter.get("/", SpecializationController.get_specialization);
SpecializationRouter.post("/", SpecializationController.create);
SpecializationRouter.get("/requests", SpecializationController.get_requests);
SpecializationRouter.post("/requests", SpecializationController.examination_request);
SpecializationRouter.put("/requests", SpecializationController.handle_request);

SpecializationRouter.post("/examination", SpecializationController.add_examination);
SpecializationRouter.put("/examination/:id", SpecializationController.update_examination);
SpecializationRouter.delete("/examination/:id", SpecializationController.delete_examination);

export default SpecializationRouter;
