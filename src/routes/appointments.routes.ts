import { Router } from "express";

import { AppointmentsController } from "@controllers/appointments.controller";

export const AppointmentsRouter = Router();

AppointmentsRouter.get("/patient/:patient/report", AppointmentsController.get_full_pdf_report);
AppointmentsRouter.get("/patient/:patient/:id/report", AppointmentsController.get_pdf_report);
AppointmentsRouter.get("/patient/:id", AppointmentsController.get_patient_appointments);
AppointmentsRouter.get("/doctor/:id", AppointmentsController.get_doctor_appointments);
AppointmentsRouter.post("/", AppointmentsController.make);
AppointmentsRouter.delete("/:appointmentId/patient", AppointmentsController.cancel_as_patient);
