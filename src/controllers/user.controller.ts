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
            const id = user._id.toString();
            const token = jwt.sign({ id, email }, process.env.JWT_SECRET!, {
                expiresIn: 60 * 60, // 1 hour+
            });
            response.status(200).json({ message: "ok", token });
        } catch (err) {
            next(err);
        }
    }
}
