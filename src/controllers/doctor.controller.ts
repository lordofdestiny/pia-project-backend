import { Request, Response, NextFunction } from "express";
import { DoctorModel, IDoctor } from "@models/doctor";
import { default_profile_picture } from "@utils/util";
import { HydratedDocument, ProjectionType } from "mongoose";

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

    private static readonly not_authenticated_get_all_filter = {
        _id: 1,
        username: 1,
        first_name: 1,
        last_name: 1,
        specialization: 1,
        profile_picture: 1,
        relative_profile_picture: 1,
        type: 0,
    };

    public static async get_all(
        _request: Request<{}, {}, IDoctor>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const data = await DoctorModel.find(
                {},
                DoctorController.not_authenticated_get_all_filter
            ).lean({
                virtuals: true,
            });
            return response.status(200).json(
                data.map((doc) => ({
                    ...doc,
                    _id: undefined,
                    profile_picture: doc.relative_profile_picture,
                    relative_profile_picture: undefined,
                }))
            );
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
            const data = await DoctorModel.findOne(
                { id },
                {
                    __v: 0,
                    password: 0,
                    salt: 0,
                }
            ).lean({ virtuals: true });
            if (data == null) {
                return response.status(404).json({ message: "doctor not found" });
            }
            const profile_picture = data.relative_profile_picture;
            return response.status(200).json({
                ...data,
                _id: undefined,
                profile_picture,
                relative_profile_picture: undefined,
            });
        } catch (err) {
            next(err);
        }
    }
}
