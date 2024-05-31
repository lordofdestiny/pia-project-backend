import {Request, Response, NextFunction} from "express";
import {MongooseError, Types} from "mongoose";
import {ObjectId} from "mongodb";
import {SpecializationModel} from "@models/specialization.model";
import {ExaminationModel, ExaminationStatus} from "@models/examination.model";

export default class SpecializationController {
    public static async get_specialization(
        request: Request<{}, {}, {}, {
            id?: string;
            name?: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const {id, name} = request.query as any;
        const query: any = {};
        if (id) {
            query._id = new Types.ObjectId(id);
        }
        if (name) {
            query.name = {$regex: new RegExp(name, "i")};
        }
        try {
            const specialization = await SpecializationModel.aggregate([
                {$match: query},
                {
                    $lookup: {
                        from: "examinations",
                        localField: "examinations",
                        foreignField: "_id",
                        as: "examinations",
                        pipeline: [
                            {$match: {status: "active"}},
                            {$sort: {name: 1}},
                            {$set: {id: "$_id"}},
                        ],
                    },
                },
                {$set: {id: "$_id"}},
                {$unset: ["_id", "examinations._id"]},
                {$sort: {name: 1}},
            ]);
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

    public static async create(
        request: Request<any, {}, {
            name: string;
        }>,
        Response: Response,
        next: NextFunction
    ) {
        const {name} = request.body;
        try {
            if (!name) {
                return Response.sendStatus(400);
            }
            const specialization = await SpecializationModel.create({
                name,
            });
            Response.status(201).json(specialization);
        } catch (error) {
            next(error);
        }
    }

    public static async get_requests(_request: Request, response: Response, next: NextFunction) {
        try {
            const request = await SpecializationModel.aggregate([
                {
                    $lookup: {
                        from: "examinations",
                        localField: "examinations",
                        foreignField: "_id",
                        as: "examinations",
                    },
                },
                {$unwind: {path: "$examinations"},},
                {$match: {"examinations.status": "requested"}},
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: [
                                "$examinations",
                                {specialization: {name: "$name", id: "$_id"},},
                            ],
                        },
                    },
                },
                {$set: {id: "$_id"}},
                {$unset: ["_id", "__v"]},
            ]);
            response.status(200).json(request);
        } catch (error) {
            next(error);
        }
    }

    public static async examination_request(
        request: Request<{}, {}, { specialization: string; duration: number }>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const {specialization: specializationId} = request.body;
            if (!ObjectId.isValid(specializationId)) {
                return response.sendStatus(400);
            }

            const specialization = await SpecializationModel.findById(specializationId);

            if (!specialization) {
                return response.sendStatus(404);
            }

            const examination = await ExaminationModel.create({
                ...request.body,
                duration: request.body.duration ?? 30,
            });

            specialization.examinations.push(examination._id);
            specialization.save();
            await specialization.populate("examinations");
            response.status(201).json(specialization);
        } catch (error) {
            next(error);
        }
    }

    public static async handle_request(
        request: Request<{}, {}, { id: string; status: any }>,
        response: Response,
        next: NextFunction
    ) {
        const {id, status} = request.body;
        if (!ObjectId.isValid(id) || typeof status !== "boolean") {
            return response.sendStatus(400);
        }
        try {
            const examination = await ExaminationModel.findById(id);
            if (!examination) {
                return response.sendStatus(404);
            }
            if (examination.status !== "requested") {
                return response.sendStatus(400);
            }
            if (status) {
                examination.status = ExaminationStatus.ACTIVE;
                await examination.save();
                await examination.populate({
                    path: "specialization",
                    populate: {
                        path: "examinations",
                        match: {status: "active"},
                    },
                });
                response.status(200).json(examination.toObject({virtuals: true}));
            } else {
                await examination.deleteOne();
                response.sendStatus(204);
            }
        } catch (error) {
            next(error);
        }
    }

    public static async add_examination(
        request: Request<{}, {}, {
            specialization: string;
            name: string;
            price: number;
            duration: number;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const {specialization: specializationId, name, price, duration} = request.body;
        if (!specializationId || !name || price == null) {
            return response.sendStatus(400);
        }
        try {
            const specialization = await SpecializationModel.findById(specializationId);
            if (!specialization) {
                return response.sendStatus(404);
            }

            const examination = await ExaminationModel.create({
                specialization: specializationId,
                name,
                price,
                duration: duration ?? 30,
            });

            specialization.examinations.push(examination._id);
            await specialization.save();

            response.status(201).json(examination.toObject({virtuals: true}));
        } catch (error) {
            next(error);
        }
    }

    public static async update_examination(
        request: Request<{ id: string; }, {}, {
            specialization: string;
            name: string;
            price: number;
            duration: number;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const {id} = request.params;
        const {specialization, name, price, duration} = request.body;
        if (
            !ObjectId.isValid(id) ||
            !ObjectId.isValid(specialization) ||
            !name ||
            !price ||
            !duration
        ) {
            return response.sendStatus(400);
        }
        try {
            const examination = await ExaminationModel.findOneAndUpdate(
                {_id: id, specialization: specialization},
                {name, price, duration},
                {new: true}
            ).lean({virtuals: true});
            if (!examination) {
                return response.sendStatus(404);
            }
            response.status(200).json(examination);
        } catch (error) {
            next(error);
        }
    }

    public static async delete_examination(
        request: Request<{ id: string }>,
        response: Response,
        next: NextFunction
    ) {
        const {id} = request.params;
        if (!ObjectId.isValid(id)) {
            return response.sendStatus(400);
        }
        try {
            const examination = await ExaminationModel.findById(id);
            if (!examination) {
                return response.sendStatus(404);
            }
            examination.status = ExaminationStatus.INACTIVE;
            await examination.save();
            response.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }
}
