import os from "os";
import path from "path";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import previewEmail from "preview-email";
import { Document, Types } from "mongoose";
import { mkdir, readFile } from "fs/promises";
import { create as createPDF } from "pdf-creator-node";
import { Request, Response, NextFunction } from "express";
import { AppointmentModel, IAppointment } from "@models/appointment.model";
import { DoctorModel, IDoctor } from "@models/doctor.model";
import { IExamination } from "@models/examination.model";
import { IPatient, PatientModel } from "@models/patient.model";
import { NotificationModel } from "@models/notification.model";

export class AppointmentsController {
    public static async get_patient_appointments(
        request: Request<{
            id: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        if (!ObjectId.isValid(request.params.id)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        try {
            const appointments = await AppointmentModel.find({
                patient: new Types.ObjectId(request.params.id),
            })
                .select("-reportPath")
                .populate({
                    path: "doctor",
                    select: "first_name last_name branch specialization",
                    populate: {
                        path: "specialization",
                        select: "name",
                    },
                })
                .populate({
                    path: "examination",
                    select: "name duration",
                })
                .lean({ virtuals: true });
            response.json(appointments);
        } catch (error) {
            next(error);
        }
    }

    public static async get_doctor_appointments(
        request: Request<{
            id: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        if (!ObjectId.isValid(request.params.id)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        try {
            const appointments = await AppointmentModel.find({
                doctor: new Types.ObjectId(request.params.id),
            })
                .select("-reportPath")
                .populate({
                    path: "patient",
                    select: "id first_name last_name username email",
                })
                .populate({
                    path: "examination",
                })
                .lean({ virtuals: true });
            response.json(appointments);
        } catch (error) {
            next(error);
        }
    }

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
        console.log(doctorId, patientId, examinationId, datetime);
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
        if (DateTime.fromISO(datetime).toJSDate() < new Date()) {
            return response.status(400).json({
                message: "Date must be in the future",
            });
        }
        if (DateTime.fromISO(datetime).hour < 7 || DateTime.fromISO(datetime).hour > 23) {
            return response.status(400).json({
                message: "Date must be between 7:00 and 23:00",
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
            const first_before = appointments
                .filter(({ datetime }) => DateTime.fromJSDate(datetime) <= new_start)
                .at(-1);
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
            const notification = await NotificationModel.create({
                message: `You have an appointment with ${doctor.first_name} ${
                    doctor.last_name
                } tomorrow at ${DateTime.fromJSDate(datetime).toFormat("HH:mm")}`,
                date: DateTime.fromJSDate(datetime).minus({ days: 1 }).toJSDate(),
                appointment: appointment.id,
                type: "appointment",
            });
            doctor.appointments.push(appointment.id);
            patient.appointments.push(appointment.id);
            patient.notifications.push({
                notification: notification.id,
                seen: false,
            });
            await Promise.all([
                doctor.save({
                    validateModifiedOnly: true,
                }),
                patient.save({
                    validateModifiedOnly: true,
                }),
                AppointmentModel.populate(appointment, {
                    path: "doctor",
                    select: "branch first_name last_name",
                }),
                AppointmentModel.populate(appointment, {
                    path: "examination",
                }),
            ]);
            return response.status(201).json({
                ...appointment.toObject({ virtuals: true }),
                reportPath: undefined,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async cancel_as_patient(
        request: Request<{
            appointmentId: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const { appointmentId: id } = request.params;
        if (!ObjectId.isValid(id)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        try {
            const appointment = await AppointmentModel.findById(id);
            if (!appointment) {
                return response.status(404).json({
                    message: "Appointment not found",
                });
            }
            const { doctor: doctorId, patient: patientId } = appointment as {
                doctor: ObjectId;
                patient: ObjectId;
            };

            await Promise.all([
                DoctorModel.findByIdAndUpdate(doctorId, {
                    $pull: {
                        appointments: new Types.ObjectId(id),
                    },
                }).exec(),
                PatientModel.findByIdAndUpdate(patientId, {
                    $pull: {
                        appointments: new Types.ObjectId(id),
                    },
                }).exec(),
                appointment.remove(),
            ]);

            response.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    public static async cancel_as_doctor(
        request: Request<
            {
                appointmentId: string;
            },
            {},
            {
                reason: string;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { appointmentId: id } = request.params;
        const { reason } = request.body;
        if (!ObjectId.isValid(id)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        try {
            const appointment = await AppointmentModel.findById(id).populate(
                "doctor",
                "first_name last_name"
            );
            if (!appointment) {
                return response.status(404).json({
                    message: "Appointment not found",
                });
            }
            const { doctor: doctorId, patient: patientId } = appointment as {
                doctor: ObjectId;
                patient: ObjectId;
            };
            const doctor = appointment.doctor as IDoctor;
            const doctor_name = `${doctor.first_name} ${doctor.last_name}`;
            const cancelNotification = await NotificationModel.create({
                message: `Appointment cancelled by ${doctor_name}: ${reason}`,
                type: "cancellation",
            });
            const appointmentNotification = await NotificationModel.findOne({
                appointment: new Types.ObjectId(id),
            });
            await Promise.all([
                DoctorModel.findByIdAndUpdate(doctorId, {
                    $pull: {
                        appointments: new Types.ObjectId(id),
                    },
                }).exec(),
                PatientModel.findByIdAndUpdate(patientId, {
                    $pull: {
                        notifications: {
                            notification: new Types.ObjectId(appointmentNotification!.id),
                        },
                    },
                }).exec(),
                PatientModel.findByIdAndUpdate(patientId, {
                    $pull: {
                        appointments: new Types.ObjectId(id),
                    },
                    $push: {
                        notifications: {
                            notification: cancelNotification._id,
                            seen: false,
                        },
                    },
                }).exec(),
                appointment.remove(),
            ]);
            await appointmentNotification!.remove();
            response.sendStatus(204);
        } catch (error) {
            next(error);
        }
    }

    public static async get_full_pdf_report(
        request: Request<{
            patient: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const { patient: patientId } = request.params;
        if (!ObjectId.isValid(patientId)) {
            return response.sendStatus(400);
        }
        try {
            const patient = await PatientModel.findById(patientId, "appointments email")
                .populate({
                    path: "appointments",
                    populate: {
                        path: "doctor",
                        select: "first_name last_name specialization",
                        populate: {
                            path: "specialization",
                            select: "name",
                        },
                    },
                    match: {
                        $nor: [
                            {
                                report: null,
                            },
                        ],
                    },
                })
                .lean({ virtuals: true });

            if (!patient) {
                return response.sendStatus(404);
            }

            console.log(patient);

            const appointments = patient.appointments as IAppointment[];
            const reports = appointments.map((appointment) => prepareReport(appointment));
            const path = await generatePdf(reports);
            await sendByEmail(patient.email, path);

            return response.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    public static async get_pdf_report(
        request: Request<{
            id: string;
            patient: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const { id, patient } = request.params;
        if (!ObjectId.isValid(id) || !ObjectId.isValid(patient)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        try {
            const appointment = await AppointmentModel.findById(id)
                .populate({
                    path: "doctor",
                    select: "first_name last_name specialization",
                    populate: {
                        path: "specialization",
                        select: "name",
                    },
                })
                .populate({
                    path: "patient",
                    select: "email",
                });

            if (!appointment) {
                return response.sendStatus(404);
            }

            if (appointment.patient.id.toString() !== patient) {
                return response.sendStatus(403);
            }

            if (!appointment.report) {
                return response.sendStatus(404);
            }
            const appointmentObj = appointment.toObject({ virtuals: true });
            if (!appointment?.reportPath?.generated) {
                const path = await generatePdf([prepareReport(appointmentObj)]);
                appointment.reportPath = {
                    generated: true,
                    path,
                };

                await appointment.save({
                    validateModifiedOnly: true,
                });
            }
            await sendByEmail((<IPatient>appointment.patient).email, appointment.reportPath.path);

            return response.sendStatus(200);
        } catch (error) {
            next(error);
        }
    }

    public static async get_past_appointments(
        request: Request<{
            id: string;
        }>,
        response: Response,
        next: NextFunction
    ) {
        const { id: patientId } = request.params;
        if (!ObjectId.isValid(patientId)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        try {
            const patient = await PatientModel.findById(patientId, {
                appointments: 1,
                first_name: 1,
                last_name: 1,
                username: 1,
                email: 1,
            })
                .populate({
                    path: "appointments",
                    match: {
                        datetime: {
                            $lte: new Date(),
                        },
                    },
                    populate: [
                        {
                            path: "doctor",
                            select: "first_name last_name branch specialization",
                            populate: {
                                path: "specialization",
                                select: "name",
                            },
                        },
                        {
                            path: "examination",
                            select: "name duration",
                        },
                    ],
                })
                .lean({ virtuals: true });

            response.json(patient);
        } catch (error) {
            next(error);
        }
    }

    public static async post_report(
        request: Request<
            {
                id: string;
            },
            {},
            {
                reason: string;
                diagnosis: string;
                therapy: string;
                followup: string;
            }
        >,
        response: Response,
        next: NextFunction
    ) {
        const { id } = request.params;
        if (!ObjectId.isValid(id)) {
            return response.status(400).json({
                message: "Invalid id",
            });
        }
        const { reason, diagnosis, therapy, followup } = request.body;
        if (!reason || !diagnosis || !therapy || !followup) {
            return response.status(400).json({
                message: "Missing parameters",
            });
        }
        const followupDate = DateTime.fromISO(followup).toJSDate();
        if (followupDate < new Date()) {
            return response.status(400).json({
                message: "Followup date must be in the future",
            });
        }
        try {
            const appointment = await AppointmentModel.findById(id)
                .select("-reportPath")
                .populate({
                    path: "patient",
                    select: "id first_name last_name username email",
                })
                .populate({
                    path: "examination",
                });
            if (!appointment) {
                return response.status(404).json({
                    message: "Appointment not found",
                });
            }
            appointment.report = {
                reason,
                diagnosis,
                therapy,
                followup: followupDate,
            };
            await appointment.save({
                validateModifiedOnly: true,
            });
            const data = {
                ...appointment.toObject({ virtuals: true }),
                reportPath: undefined,
            };
            response.status(200).json(data);
        } catch (error) {
            next(error);
        }
    }
}

function prepareReport(appointment: IAppointment) {
    const doctor = appointment.doctor as IDoctor;
    return {
        ...appointment.report,
        doctor: `${doctor.first_name} ${doctor.last_name}`,
        specialization: doctor.specialization?.name,
        date: DateTime.fromJSDate(appointment.datetime).toFormat("dd.MM.yyyy."),
        time: DateTime.fromJSDate(appointment.datetime).toFormat("HH:mm"),
        followup: DateTime.fromJSDate(appointment.report!.followup).toFormat("dd.MM.yyyy."),
    };
}

function generateUniquePath() {
    const base = path.join(__dirname, "..", "..", "public", "downloads", "reports");
    const uid = nanoid();
    const filename = `report_${new Date().getTime()}_${uid}.pdf`;
    return path.join(base, filename);
}

async function generatePdf(reports: any[]) {
    const htmlPath = path.join(__dirname, "..", "templates", "report.html");
    const html = await readFile(htmlPath, "utf8");
    const filePath = generateUniquePath();
    await mkdir(path.dirname(filePath), { recursive: true });
    await createPDF(
        {
            html,
            data: {
                reports,
            },
            path: filePath,
            type: "",
        },
        {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
        }
    );

    return filePath;
}

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;
const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
    },
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
    },
});

const networkInterfacesDict = os.networkInterfaces();
const ipv4 = Object.keys(networkInterfacesDict)
    .map((key) => networkInterfacesDict[key]!)
    .flat()
    .filter(({ family }) => family === "IPv4")
    .filter(({ internal }) => !internal)
    .map(({ address }) => address);

async function sendByEmail(patientMail: string, pdfPath: string) {
    const relativePath = path.relative("public", pdfPath).replace(/\\/g, "/");
    const pdfurl = `${ipv4[0]}:${process.env.PORT}/${relativePath}`;
    const qrcodebase64 = await QRCode.toDataURL(pdfurl);

    const message = {
        from: `HouseMedica <${SENDER_EMAIL}>`,
        to: patientMail,
        subject: "Appointment report(s)",
        html: `
            <h1 style="text-align: center">Greetings!</h1>
            <p style="text-align: center">You can find appointment reports in the attachment!</p>
            <p style="text-align: center"> Should you need it, you can use the following QR code to access the attached report</p>
            <div style="width: 100%; height:100%; text-align: center;">
                <img src="${qrcodebase64}" alt="QR code" />
            </div>
        `,
        attachDataUrls: true,
        attachments: [
            {
                filename: "report.pdf",
                path: pdfPath,
            },
        ],
    };

    if (process.env.SHOW_MAIL_PREVIEW?.toLowerCase() === "yes") {
        await previewEmail(
            JSON.parse(
                (
                    await nodemailer
                        .createTransport({
                            jsonTransport: true,
                        })
                        .sendMail(message as any)
                ).message
            )
        );
    } else {
        try {
            await transporter.sendMail(message);
        } catch (e) {
            console.log("Error sending mail, check your Internet connection");
        }
    }
}
