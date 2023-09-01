import { Request, Response, NextFunction } from "express";
import { PatientModel, IPatient } from "@models/patient.model";
import { default_profile_picture } from "@utils/util";

export default class PatientController {
    public static async register(
        request: Request<{}, {}, IPatient>,
        response: Response,
        next: NextFunction
    ) {
        if (request.isAuthenticated()) {
            return response.status(409).json({ message: "already logged in" });
        }
        if (request.file === undefined && (request.file_not_image ?? false)) {
            return response.status(400).json({ message: "file that was send was not an image" });
        }
        const { body: data } = request;
        const profile_picture = request.file?.path ?? default_profile_picture;
        try {
            const user = await PatientModel.create({ ...data, profile_picture });
            const userObj = user.toObject();
            Object.assign(userObj, {
                profile_picture: userObj.relative_profile_picture,
                relative_profile_picture: undefined,
            });
            response.status(201).json(userObj);
        } catch (err) {
            next(err);
        }
    }
}
