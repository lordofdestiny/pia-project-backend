import { Schema, Model } from "mongoose";
import User, { IUser } from "./user";

export interface IManager extends IUser {}

interface IManagerMethods {}

type ManagerModel = Model<IManager, {}, IManagerMethods>;

const managerSchema = new Schema<IManager, ManagerModel, IManagerMethods>(
    {},
    {
        discriminatorKey: "type",
    }
);

export default User.discriminator("Manager", managerSchema, "Manager");
