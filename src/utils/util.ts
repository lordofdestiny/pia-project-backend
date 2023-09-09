import { IUser } from "@models/user.model";
import path from "path";

export const default_profile_picture = path.resolve(
    process.cwd(),
    "public",
    "resources",
    "img",
    "default.jpeg"
);

export function relativizePicturePath(picture_path: string) {
    const file_route = path.relative("public", picture_path).replace(/\\/g, "/");
    return `/${file_route}`;
}

export function resolvePicturePath(user: IUser) {
    const { profile_picture } = user;
    Object.assign(user, { profile_picture: relativizePicturePath(profile_picture) });
    return user;
}
