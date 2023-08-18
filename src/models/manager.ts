import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "./user";

export interface IManager extends IUser {}

interface IManagerMethods extends IUserMethods {}

type TManagerModel = Model<IManager, {}, IManagerMethods>;

const managerSchema = new Schema<IManager, TManagerModel, IManagerMethods>(
    {},
    {
        discriminatorKey: "type",
    }
);

export const ManagerModel = UserModel.discriminator("Manager", managerSchema, EUserRole.MANAGER);
