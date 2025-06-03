import { diskStorage, StorageEngine } from 'multer';
import { extname } from 'path';

import { WrongFileExtensionException } from '../errors';

interface MulterOptions {
  storage: StorageEngine;
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => void;
}

export const createFileUploadConfig = (
  prefix: string = 'file',
  destination: string = './uploads',
  allowedExtensions: string[] = ['.xlsx'],
): MulterOptions => ({
  storage: diskStorage({
    destination,
    filename: (req, file, cb): void => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${prefix}-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb): void => {
    const fileExtension = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new WrongFileExtensionException(allowedExtensions, fileExtension), false);
    }

    cb(null, true);
  },
});
