import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/user";
import Patient, { IPatient } from "../models/patient";

export default class PatientController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await Patient.create(data);
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
