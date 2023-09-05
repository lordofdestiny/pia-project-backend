import { Router } from "express";
import { disable } from "@middleware/disable_route";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { ManagerModel } from "@models/manager.model";
import { default_profile_picture } from "@utils/util";
import ManagerController from "@controllers/manager.controller";

const ManagerRouter = Router();

ManagerRouter.post("/register", disable, ManagerController.register);

export default ManagerRouter;
