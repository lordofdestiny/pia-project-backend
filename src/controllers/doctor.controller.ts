import { Request, Response, NextFunction } from "express";
import { HydratedDocument, MongooseError } from "mongoose";
import Doctor, { IDoctor } from "../models/doctor";
import { UserModel, IUser } from "../models/user";

export default class DoctorController {
    public static async register(
        request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await Doctor.create(data);
            response.status(201).json(
                Object.assign(user.toObject(), {
                    _id: undefined,
                    password: undefined,
                    salt: undefined,
                })
            );
        } catch (err) {
            next(err);
        }
    }
}
