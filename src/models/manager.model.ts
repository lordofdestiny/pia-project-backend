import { Schema, Model } from "mongoose";
import { UserModel, IUser, IUserMethods, EUserRole } from "@models/user.model";

export interface IManager extends IUser {}

interface IManagerMethods extends IUserMethods {}

type TManagerModel = Model<IManager, {}, IManagerMethods>;

const ManagerSchema = new Schema<IManager, TManagerModel, IManagerMethods>(
    {},
    {
        discriminatorKey: "type",
        toObject: {
            virtuals: true,
        },
    }
);

export const ManagerModel = UserModel.discriminator("Manager", ManagerSchema, EUserRole.MANAGER);
