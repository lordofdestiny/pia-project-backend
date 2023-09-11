import { AppointmentModel, IAppointment } from "@models/appointment.model";
import { DoctorModel, IDoctor } from "@models/doctor.model";
import { IExamination } from "@models/examination.model";
import { IPatient, PatientModel } from "@models/patient.model";
import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import { Document } from "mongoose";

export class AppointmentsController {
    public static async make(
        request: Request<
            {},
            IAppointment,
            {
                doctorId: string;
                patientId: string;
                examinationId: string;
                datetime: string;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { doctorId, patientId, examinationId, datetime } = request.body;
        if (!doctorId || !patientId || !examinationId || !datetime) {
            return response.status(400).json({
                message: "Missing parameters",
            });
        }
        if (
            !ObjectId.isValid(doctorId) ||
            !ObjectId.isValid(patientId) ||
            !ObjectId.isValid(examinationId)
        ) {
            return response.status(400).json({
                message: "Invalid parameters",
            });
        }
        try {
            const doctor = await DoctorModel.findById(doctorId)
                .populate("examinations")
                .populate("appointments");
            if (!doctor) {
                return response.status(404).json({
                    message: "Doctor not found",
                });
            }
            const patient = await PatientModel.findById(patientId);
            if (!patient) {
                return response.status(404).json({
                    message: "Patient not found",
                });
            }
            const doctorObj = doctor.toObject({ virtuals: true });
            const examination = (<IExamination[]>doctorObj.examinations).find(
                (examination) => examination.id.toString() === examinationId
            );

            if (!examination) {
                return response.status(404).json({
                    message: "Examination not found",
                });
            }

            const date = DateTime.fromISO(datetime).toJSDate();
            const new_start = DateTime.fromISO(datetime);
            const new_end = new_start.plus({ minutes: examination.duration });

            // Check if the doctor is on vacation
            if (
                doctorObj.vacations.some(
                    ({ start_date, end_date }) => date >= start_date && date <= end_date
                )
            ) {
                return response.status(400).json({
                    message: "Doctor is not available at that time",
                });
            }

            const appointments = doctor.appointments as IAppointment[];

            const day_appointments = appointments.filter(({ datetime }) =>
                DateTime.fromJSDate(datetime).hasSame(new_start, "day")
            );

            if (day_appointments.length === 0) {
                return AppointmentsController.handleMakeAppointment(
                    doctor,
                    patient,
                    examination.id as ObjectId,
                    date,
                    response,
                    next
                );
            }

            const getEnd = (appointment: IAppointment) =>
                DateTime.fromJSDate(appointment.datetime).plus({
                    minutes: (<IExamination>appointment.examination).duration,
                });

            // First appointment before the requested one
            const first_before = appointments.find(
                ({ datetime }) => DateTime.fromJSDate(datetime) <= new_start
            );
            const first_after = appointments.find(
                ({ datetime }) => DateTime.fromJSDate(datetime) >= new_start
            );

            if (
                first_after &&
                first_before &&
                getEnd(first_before) <= new_start &&
                new_end <= getEnd(first_after)
            ) {
                return AppointmentsController.handleMakeAppointment(
                    doctor,
                    patient,
                    examination.id as ObjectId,
                    date,
                    response,
                    next
                );
            }
            if (!first_before && first_after && new_end <= getEnd(first_after)) {
                return AppointmentsController.handleMakeAppointment(
                    doctor,
                    patient,
                    examination.id as ObjectId,
                    date,
                    response,
                    next
                );
            }
            if (first_before && !first_after && getEnd(first_before) <= new_start) {
                return AppointmentsController.handleMakeAppointment(
                    doctor,
                    patient,
                    examination.id as ObjectId,
                    date,
                    response,
                    next
                );
            }

            return response.status(400).json({
                message: "Doctor is not available at that time",
            });
        } catch (error) {
            next(error);
        }
    }

    private static async handleMakeAppointment(
        doctor: Document<unknown, any, IDoctor> & IDoctor,
        patient: Document<unknown, any, IPatient> & IPatient,
        examinationId: ObjectId,
        datetime: Date,
        response: Response,
        next: NextFunction
    ) {
        try {
            const appointment = await AppointmentModel.create({
                doctor: doctor.id,
                patient: patient.id,
                examination: examinationId,
                datetime,
            });
            doctor.appointments.push(appointment.id);
            await doctor.save({
                validateModifiedOnly: true,
            });
            patient.appointments.push(appointment.id);
            await patient.save({
                validateModifiedOnly: true,
            });
            await AppointmentModel.populate(appointment, {
                path: "doctor",
                select: "branch first_name last_name",
            });
            await AppointmentModel.populate(appointment, {
                path: "examination",
                select: "name",
            });
            return response.status(201).json(appointment.toObject({ virtuals: true }));
        } catch (error) {
            next(error);
        }
    }
}
