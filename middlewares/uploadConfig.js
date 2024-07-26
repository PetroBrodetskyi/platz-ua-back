import multer from 'multer';
import path from 'path';
import HttpError from "../helpers/HttpError.js";

// Configuration for user avatars
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
    return callback(HttpError(400, '.exe extention not allow'));
  }
  callback(null, true);
};

const avatarLimits = {
  fileSize: 1024 * 1024 * 5, // 5 MB
};

// Configuration for product photos

const productFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/avif') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const destination = path.resolve("public");

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniquePrefix}_${file.originalname}`;
    cb(null, filename);
  }
});



const uploadProductPhoto = multer({
  storage: productStorage,
  fileFilter: productFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
    files: 4
  }
});

// Multer instances
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: avatarLimits,
  fileFilter: avatarFileFilter,
});

export { uploadAvatar, uploadProductPhoto };
