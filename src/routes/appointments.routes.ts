import { Router } from "express";

import { AppointmentsController } from "@controllers/appointments.controller";

export const AppointmentsRouter = Router();

AppointmentsRouter.post("/", AppointmentsController.make);
