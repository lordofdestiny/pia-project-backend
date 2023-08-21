import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user";

export interface IManager extends IUser {}

interface IManagerMethods extends IUserMethods {}

type TManagerModel = Model<IManager, {}, IManagerMethods>;

const managerSchema = new Schema<IManager, TManagerModel, IManagerMethods>(
    {},
    {
        discriminatorKey: "type",
        toObject: {
            virtuals: true,
        },
    }
);

export const ManagerModel = UserModel.discriminator("Manager", managerSchema, EUserRole.MANAGER);
