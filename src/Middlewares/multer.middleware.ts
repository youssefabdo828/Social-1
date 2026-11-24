import multer from "multer";
import crypto from "node:crypto";
import { BadRequestException } from "../common/Utils/Errors/exception.error";
import { allowedExtension } from "../common/types/enum";
import { Request } from 'express';





    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const suffix = crypto.randomBytes(5).toString("hex") + Date.now();
            cb(null, `${suffix} __ ${file.originalname}`);
        },
    });

    const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
        const [fileType, fileExtension] = file.mimetype.split("/");
        const fileTypeInput = fileType as keyof typeof allowedExtension
        const acceptableExtension = allowedExtension[fileTypeInput];
        if (acceptableExtension?.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(
                new BadRequestException(
                    "Invalid file extension",
                    { acceptableExtension },
                    "MULTER_ERROR",
                ),
                false,
            );
        }
    };

export const multerUpload = multer({ fileFilter, storage });

