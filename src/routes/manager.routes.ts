import { Router } from "express";
import { disable } from "@middleware/disable_route";
import ManagerController from "@controllers/manager.controller";

const ManagerRouter = Router();

ManagerRouter.post("/register", disable, ManagerController.register);
ManagerRouter.post("/notification", ManagerController.create_notification);

export default ManagerRouter;
