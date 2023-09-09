import { Router } from "express";
import { disable } from "@middleware/disable_route";
import ManagerController from "@controllers/manager.controller";

const ManagerRouter = Router();

ManagerRouter.post("/register", disable, ManagerController.register);
ManagerRouter.get("/promotions", ManagerController.get_promotions);
ManagerRouter.post("/promotions", ManagerController.create_promotion);

export default ManagerRouter;
