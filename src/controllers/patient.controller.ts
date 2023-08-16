import { Request, Response, NextFunction } from "express";
import { MongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../models/user";
import Patient, { IPatient } from "../models/patient";

export default class PatientController {}
