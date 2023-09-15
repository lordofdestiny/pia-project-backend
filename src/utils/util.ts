import path from "path";

export const default_profile_picture = "/resources/img/default.jpeg";

export function relativizePicturePath(picture_path: string | null | undefined) {
    if (picture_path == null) return null;
    const file_route = path.relative("public", picture_path).replace(/\\/g, "/");
    return `/${file_route}`;
}

export function resolvePicturePath(picture_path: string | null | undefined) {
    if (picture_path == null) return null;
    return path.resolve(process.cwd(), "public", picture_path.substring(1));
}
