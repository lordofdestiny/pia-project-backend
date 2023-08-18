import { Router } from "express";
import { disable } from "../middleware/disable_route";
import { NextFunction, Request, Response } from "express-serve-static-core";
import { ManagerModel } from "../models/manager";
import { default_profile_picture } from "../utils/util";

const ManagerRouter = Router();

ManagerRouter.post(
    "/register",
    disable,
    async (request: Request, response: Response, next: NextFunction) => {
        const { body: data } = request;
        try {
            const user = await ManagerModel.create({
                ...data,
                profile_picture: default_profile_picture,
            });
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }
);

export default ManagerRouter;
