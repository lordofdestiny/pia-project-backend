import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "./user";

export interface IManager extends IUser {}

interface IManagerMethods extends IUserMethods {}

type ManagerModel = Model<IManager, {}, IManagerMethods>;

const managerSchema = new Schema<IManager, ManagerModel, IManagerMethods>(
    {},
    {
        discriminatorKey: "type",
    }
);

export default UserModel.discriminator("Manager", managerSchema, EUserRole.MANAGER);
