import bcrypt from "bcrypt";
import crypto from "crypto";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

import { relativizePicturePath } from "@utils/util";
import { Schema, Model, model, CallbackError, HydratedDocument } from "mongoose";

export enum EUserRole {
    USER = "user",
    PATIENT = "patient",
    DOCTOR = "doctor",
    MANAGER = "manager",
}

export interface SessionUser {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    profile_picture: string;
    relative_profile_picture: string;
    type: Exclude<EUserRole, EUserRole.USER>;
}

export const session_fields: (keyof SessionUser | string)[] = [
    "id",
    "username",
    "email",
    "first_name",
    "last_name",
    "type",
    "address",
    "phone",
    "profile_picture",
    "licence_number",
    "specialization",
    "branch",
];

declare global {
    namespace Express {
        interface User extends SessionUser {}
    }
}

export interface IUser extends SessionUser {
    profile_picture: string;
    salt?: string;
    password?: string;
}

export interface IUserMethods {
    comparePassword: (password: string) => Promise<boolean>;
}

export interface IUserVirtuals {
    get relative_profile_picture(): string;
}

type TUserModel = Model<IUser, {}, IUserMethods, IUserVirtuals>;

const UserSchema = new Schema<IUser, TUserModel, IUserMethods>(
    {
        username: {
            type: String,
            trim: true,
            required: [true, "Username is required"],
            match: /^[_-]*[a-zA-Z][\w-]*$/,
            unique: true,
            minlength: [4, "Username must be at least 6 characters long"],
            maxlength: [20, "Username must be at most 20 characters long"],
            validate: {
                validator: async function (this: any, username: string) {
                    if (this.model.countDocuments) {
                        return !(await this.model.countDocuments({
                            username,
                        }));
                    } else {
                        return !(await this.model("User").countDocuments({
                            username,
                        }));
                    }
                },
                message: () => "Username already exists",
            },
        },
        email: {
            type: String,
            trim: true,
            required: [true, "Email is required"],
            match: /^[\w-](?:\.?[\w-]){0,63}@[\w-]{1,63}(?:\.[\w-]{1,63})*$/,
            unique: true,
            validate: {
                validator: async function (this: any, email: string) {
                    if (this.model.countDocuments) {
                        return !(await this.model.countDocuments({
                            email,
                        }));
                    } else {
                        return !(await this.model("User").countDocuments({
                            email,
                        }));
                    }
                },
                message: () => "Email already exists",
            },
        },
        first_name: {
            type: String,
            trim: true,
            required: [true, "First name is required"],
        },
        last_name: {
            type: String,
            trim: true,
            required: [true, "Last name is required"],
        },
        address: {
            type: String,
            trim: true,
            required: [true, "Address is required"],
        },
        phone: {
            type: String,
            trim: true,
            required: [true, "Phone number is required"],
            match: /^((\+381)|0)?[\s-]*6[\s-]*(([0-6]|[8-9]|(7[\s-]*[7-8]))(?:[ -]*\d[ -]*){6,7})$/,
        },
        profile_picture: {
            type: String,
            required: false,
            default: null,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        salt: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            trim: true,
            enum: Object.freeze(Object.values(EUserRole)),
            required: [true, "User role is required"],
        },
    },
    {
        discriminatorKey: "type",
        toObject: {
            getters: true,
            virtuals: true,
        },
    }
);

function digestPassword(password: string, salt: string, algorithm = "sha256"): string {
    return crypto.createHmac(algorithm, salt).update(password).digest("hex");
}

async function digestAndBcryptPassword(password: string, salt: string, algorithm = "sha256") {
    const digest = digestPassword(password, salt, algorithm);
    return bcrypt.hash(digest, salt);
}

UserSchema.virtual("relative_profile_picture").get(function (this: IUser) {
    if (!this.profile_picture) return null;
    return relativizePicturePath(this.profile_picture);
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (this.password === undefined) return next(new Error("Password is required"));
    try {
        this.salt = await bcrypt.genSalt(10);
        this.password = await digestAndBcryptPassword(this.password, this.salt);
        next();
    } catch (err) {
        next(err as CallbackError);
    }
});

UserSchema.set("toObject", {
    transform: (_doc: HydratedDocument<IUser, IUserMethods>, result) => {
        delete result.__v;
        delete result.password;
        delete result.salt;
        return result;
    },
});

UserSchema.method("comparePassword", async function (password: string) {
    return bcrypt.compare(await digestPassword(password, this.salt), this.password!);
});

UserSchema.plugin(mongooseLeanVirtuals);

export const UserModel = model<IUser, TUserModel>("User", UserSchema, "users");
