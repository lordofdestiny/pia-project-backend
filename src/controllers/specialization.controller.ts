import { Request, Response, NextFunction, response } from "express";
import { SpecializationModel, ISpecialization } from "@models/specialization.model";
import { MongooseError } from "mongoose";

export default class SpecializationController {
    public static async get_all(request: Request, Response: Response, next: NextFunction) {
        try {
            const specializations = await SpecializationModel.find()
                .sort("name")
                .populate("examinations")
                .lean({ virtuals: true });
            Response.status(200).json(specializations);
        } catch (error) {
            next(error);
        }
    }

    public static async get_specialization(
        request: Request<
            any,
            any,
            any,
            {
                id?: string;
                name?: string;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { id, name } = request.query;
        try {
            const specializationQuery = id
                ? SpecializationModel.findById(id)
                : name
                ? SpecializationModel.findOne({
                      name: { $regex: new RegExp(`^${name}$`, "i") },
                  })
                : null;
            if (!specializationQuery) {
                return response.sendStatus(400);
            }
            const specialization = await specializationQuery
                .populate("examinations")
                .lean({ virtuals: true });
            if (!specialization) {
                return response.sendStatus(404);
            }
            return response.status(200).json(specialization);
        } catch (error) {
            if ((error as MongooseError).name === "CastError") {
                return response.sendStatus(400);
            }
            next(error);
        }
    }

    public static async create(request: Request, Response: Response, next: NextFunction) {
        try {
            const specialization = await SpecializationModel.create(request.body);
            Response.status(201).json(specialization);
        } catch (error) {
            next(error);
        }
    }

    public static async get_examinations(request: Request, Response: Response, next: NextFunction) {
        try {
            const { id } = request.params;
            const specialization = await SpecializationModel.findById(id);
            if (!specialization) {
                return Response.sendStatus(404);
            }
            Response.status(200).json(specialization.examinations);
        } catch (error) {
            next(error);
        }
    }

    public static async add_examination(request: Request, Response: Response, next: NextFunction) {
        try {
            const { id } = request.params;
            const { name, duration, price } = request.body;

            const specialization = await SpecializationModel.findOneAndUpdate(
                { _id: id },
                {
                    $push: { examinations: { name, duration, price } },
                },
                {
                    new: true,
                }
            ).lean({ virtuals: true });
            Response.status(201).json(specialization);
        } catch (error) {
            next(error);
        }
    }
}
