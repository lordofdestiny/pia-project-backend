import { Request, Response, NextFunction } from "express";
import { HydratedDocument, MongooseError } from "mongoose";
import { DoctorModel, IDoctor } from "../models/doctor";

export default class DoctorController {
    public static async register(
        request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await DoctorModel.create(data);
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }
}
