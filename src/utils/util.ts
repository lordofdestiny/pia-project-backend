import path from "path";

export function relativizePicturePath(picture_path: string) {
    const file_route = path.relative("public", picture_path).replace(/\\/g, "/");
    return `/${file_route}`;
}
