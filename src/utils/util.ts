import path from "path";

export const default_profile_picture = path.resolve(
    process.cwd(),
    "public",
    "resources",
    "img",
    "default.png"
);

export function relativizePicturePath(picture_path: string) {
    const file_route = path.relative("public", picture_path).replace(/\\/g, "/");
    return `/${file_route}`;
}
