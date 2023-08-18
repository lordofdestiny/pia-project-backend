import { Request, Response, NextFunction } from "express";
import { DoctorModel, IDoctor } from "../models/doctor";
import { default_profile_picture } from "../utils/util";

export default class DoctorController {
    public static async register(
        request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        if (request.file === undefined && (request.file_not_image ?? false)) {
            return response.status(400).json({ message: "file that was send was not an image" });
        }
        const { body: data } = request;
        const profile_picture = request.file?.path ?? default_profile_picture;
        try {
            const user = await DoctorModel.create({ ...data, profile_picture });
            response.status(201).json(user.toObject());
        } catch (err) {
            next(err);
        }
    }

    public static async get_all(
        _request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const data = await DoctorModel.find();
            return response.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }

    public static async get_by_id(
        request: Request<{ id: "string" }, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        const { id } = request.params;
        try {
            const data = await DoctorModel.findById(id);
            if (data == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            return response.status(200).json(data);
        } catch (err) {
            next(err);
        }
    }
}
