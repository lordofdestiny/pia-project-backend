import { Schema, Model, model, Document, CallbackError } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import "../utils/string-utils";

export interface IUser {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    address: string;
    phone: string;
    email: string;
    profile_picture: string;
    role: string;
}

interface IUserMethods {
    comparePassword: (password: string) => Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            match: /^[_-]*[a-zA-Z][\w-]*$/,
            unique: true,
            minlength: [4, "Username must be at least 6 characters long"],
            maxlength: [20, "Username must be at most 20 characters long"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
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
        email: {
            type: String,
            required: [true, "Email is required"],
            match: /^[\w-](?:\.?[\w-]){0,63}@[\w-]{1,63}(?:\.[\w-]{1,63})*$/,
            unique: true,
        },
        profile_picture: {
            type: String,
            required: false,
            default: null,
        },
    },
    {
        discriminatorKey: "type",
    }
);

userSchema.path("username").validate(async function (username: string) {
    return (await this.$model("User").countDocuments({ username })) == 0;
}, "Username already exists");

userSchema.path("email").validate(async function (email: string) {
    return (await this.$model("User").countDocuments({ email })) == 0;
}, "Email already exists");

export async function digestPassword(password: string, salt: string) {
    return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (this.password === undefined) return next(new Error("Password is required"));
    try {
        const salt = await bcrypt.genSalt(10);
        const digest = await digestPassword(this.password, salt);
        this.password = await bcrypt.hash(digest, salt);
        next();
    } catch (err) {
        next(err as CallbackError);
    }
});

userSchema.method("comparePassword", async function (password: string) {
    const digest = await digestPassword(password, this.salt);
    const hash = await bcrypt.hash(digest, this.salt);
    return bcrypt.compare(password, hash);
});

export default model<IUser, UserModel>("User", userSchema, "users");
