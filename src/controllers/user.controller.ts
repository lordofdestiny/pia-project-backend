import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import jwt from "jsonwebtoken";

import Patient, { IPatient } from "../models/patient";
import { UserModel, IUser } from "../models/user";

interface ILoginBody {
    email?: string;
    password?: string;
}

export default class UserController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await Patient.create(data);
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }

    public static async login(
        { body: { email, password } = {} }: Request<{}, {}, ILoginBody>,
        response: Response,
        next: NextFunction
    ) {
        if (email === undefined || password === undefined) {
            return response.status(400).json({ message: "email and password are required" });
        }
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                return response.status(404).json({ message: "user not found" });
            }
            if (!user.comparePassword(password)) {
                return response.status(401).json({ message: "invalid credentials" });
            }
            const { id, username } = user.toObject();
            const token = jwt.sign({ id, email, username }, process.env.JWT_SECRET!, {
                expiresIn: 60 * 60, // 1 hour+
            });
            response.status(200).json({ message: "ok", token });
        } catch (err) {
            next(err);
        }
    }
    public static async logout(request: Request, response: Response, next: NextFunction) {
        response.status(200).json({ message: "ok" });
    }
}
