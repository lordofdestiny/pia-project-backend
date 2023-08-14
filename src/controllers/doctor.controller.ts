import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import Doctor, { IDoctor } from "../models/doctor";
import { mongooseErrorHandler } from "../utils/error-handler";
import "../utils/string-utils";

export default class DoctorController {
    public static async register(
        request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await Doctor.create(data);
            response
                .status(201)
                .json(Object.assign(user.toObject(), { _id: undefined, password: undefined }));
        } catch (err) {
            next(err);
        }
    }
}
