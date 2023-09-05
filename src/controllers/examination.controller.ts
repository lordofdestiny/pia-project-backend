import { ExaminationModel } from "@models/examination.model";
import { Request, Response, NextFunction } from "express";

export default class ExaminationController {
    public static async for_specialization(
        request: Request<{}, {}, {}, { spec: string }>,
        response: Response,
        next: NextFunction
    ) {
        try {
            const examinations = await ExaminationModel.find({
                specialization: request.query.spec,
            }).lean({ virtuals: true });
            response.status(200).json(examinations);
        } catch (error) {
            next(error);
        }
    }
}
