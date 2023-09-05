import ExaminationController from "@controllers/examination.controller";
import { Router } from "express";

const ExaminationsRouter = Router();

ExaminationsRouter.get("/", ExaminationController.for_specialization);

export default ExaminationsRouter;
