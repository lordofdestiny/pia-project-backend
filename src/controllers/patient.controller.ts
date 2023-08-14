import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import Patient, { IPatient } from "../models/patient";
import { mongooseErrorHandler } from "../utils/error-handler";
import "../utils/string-utils";

export default class PatientController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        const { body: data } = request;
        try {
            const user = await Patient.create(data);
            response
                .status(201)
                .json(Object.assign(user.toObject(), { _id: undefined, password: undefined }));
        } catch (err) {
            next(err);
        }
    }
}
