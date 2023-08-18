import bcrypt from "bcrypt";
import crypto from "crypto";

import { Schema, Model, model, Document, CallbackError, Types, HydratedDocument } from "mongoose";

export enum EUserRole {
    USER = "user",
    PATIENT = "patient",
    DOCTOR = "doctor",
    MANAGER = "manager",
}
export interface IUser {
    id?: string;
    _id?: Types.ObjectId;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    profile_picture: string;
    salt?: string;
    password?: string;
    type: EUserRole;
}

export interface IUserMethods {
    comparePassword: (password: string) => Promise<boolean>;
}

export interface IUserVirtuals {
    get id(): string;
}

type UserModel = Model<IUser, {}, IUserMethods, IUserVirtuals>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            match: /^[_-]*[a-zA-Z][\w-]*$/,
            unique: true,
            minlength: [4, "Username must be at least 6 characters long"],
            maxlength: [20, "Username must be at most 20 characters long"],
            validate: {
                validator: async function (this: Document<IUser>, username: string) {
                    return !(await this.$model("User").countDocuments({
                        username,
                    }));
                },
                message: () => "Username already exists",
            },
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            match: /^[\w-](?:\.?[\w-]){0,63}@[\w-]{1,63}(?:\.[\w-]{1,63})*$/,
            unique: true,
            validate: {
                validator: async function (this: Document<IUser>, email: string) {
                    return !(await this.$model("User").countDocuments({
                        email,
                    }));
                },
                message: () => "Email already exists",
            },
        },
        first_name: {
            type: String,
            required: [true, "First name is required"],
        },
        last_name: {
            type: String,
            required: [true, "Last name is required"],
        },
        address: {
            type: String,
            required: [true, "Address is required"],
        },
        phone: {
            type: String,
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
            default: EUserRole.USER,
        },
    },
    {
        discriminatorKey: "type",
    }
);

userSchema.virtual("id").get(function () {
    return this._id.toString();
});

function digestPassword(password: string, salt: string, algorithm = "sha256"): string {
    return crypto.createHmac(algorithm, salt).update(password).digest("hex");
}

async function digestAndBcryptPassword(password: string, salt: string, algorithm = "sha256") {
    const digest = digestPassword(password, salt, algorithm);
    return bcrypt.hash(digest, salt);
}

userSchema.pre("save", async function (next) {
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

userSchema.set("toObject", {
    transform: (doc: HydratedDocument<IUser, IUserMethods>, result: IUser) => {
        result.id = doc.id;
        delete result._id;
        delete result.password;
        delete result.salt;
        return result;
    },
});

userSchema.method("comparePassword", async function (password: string) {
    return bcrypt.compare(await digestPassword(password, this.salt), this.password!);
});

export const UserModel = model<IUser, UserModel>("User", userSchema, "users");
