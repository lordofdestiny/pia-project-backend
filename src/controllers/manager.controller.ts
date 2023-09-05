import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import { UserModel, IUser } from "@models/user.model";
import { PatientModel, IPatient } from "@models/patient.model";
import { default_profile_picture } from "@utils/util";
import { ManagerModel } from "@models/manager.model";

export default class ManagerController {
    public static async register(request: Request, response: Response, next: NextFunction) {
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
}
