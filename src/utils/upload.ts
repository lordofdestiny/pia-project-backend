import {resolve} from "node:path";
import {nanoid} from "nanoid";
import {extension} from "mime-types";
import multer, {diskStorage} from "multer";
import {Request} from "express";

const cwd = process.cwd();
const path = resolve(cwd, "public", "uploads", "images", "profile");

// Use IIFE to make sure nanoid is imported before the storage is initialized
export const storage = diskStorage({
    destination: path,
    filename: async function (_request, file: Express.Multer.File, callback) {
        const id = nanoid();
        const ext = extension(file.mimetype);
        const filename = `${file.fieldname}_${id}.${ext}`;
        callback(null, filename);
    },
});

declare global {
    namespace Express {
        export interface Request {
            file_not_image?: boolean | undefined;
        }
    }
}

export function imageFileFilter(request: Request, file: Express.Multer.File, callback) {
    const test = file.mimetype.startsWith("image/");
    request.file_not_image = !test;
    callback(null, test);
}

export const upload = multer({storage: storage, fileFilter: imageFileFilter});
