import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import { UserModel, IUser } from "../models/user";
import { PatientModel, IPatient } from "../models/patient";

export default class PatientController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await UserModel.create(data);
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }

    public static async profile(request: Request, response: Response, next: NextFunction) {
        if (!request.isAuthenticated()) {
            return response.status(401).json({ message: "unauthorized" });
        }
        try {
            return response
                .status(200)
                .json(Object.assign({}, request.user, { id: undefined, type: undefined }));
        } catch (error) {
            return next(error);
        }
    }
}
