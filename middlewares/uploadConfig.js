import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import HttpError from "../helpers/HttpError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'product_photos',
    public_id: (req, file) => `${Date.now()}_${Math.round(Math.random() * 1E9)}_${file.originalname}`,
    transformation: [
      {
        quality: 'auto',
        format: 'webp',
      },
    ],
  },
});

const uploadProductPhoto = multer({
  storage: cloudinaryStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
    files: 4,
  },
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('tmp'));
  },
  filename: (req, file, cb) => {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniquePrefix}_${file.originalname}`;
    cb(null, filename);
  },
});

const avatarFileFilter = (req, file, callback) => {
  const extention = file.originalname.split('.').pop();
  if (extention === 'exe') {
    return callback(HttpError(400, '.exe extension not allowed'));
  }
  callback(null, true);
};

const avatarLimits = {
  fileSize: 1024 * 1024 * 5, // 5 MB
};

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: avatarLimits,
  fileFilter: avatarFileFilter,
});

export { uploadAvatar, uploadProductPhoto };
