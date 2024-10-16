import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "product_photos",
    public_id: (req, file) =>
      `${Date.now()}_${Math.round(Math.random() * 1e9)}_${
        path.parse(file.originalname).name
      }`,
    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: "limit",
        quality: "auto",
        fetch_format: "webp",
      },
    ],
  },
});

const uploadProductPhoto = multer({
  storage: cloudinaryStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
    files: 4,
  },
});

const avatarCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_avatars",
    public_id: (req, file) =>
      `${Date.now()}_${Math.round(Math.random() * 1e9)}_${
        path.parse(file.originalname).name
      }`,
    transformation: [
      {
        width: 200,
        height: 200,
        crop: "fill",
        quality: "auto",
        fetch_format: "webp",
      },
    ],
  },
});

const uploadAvatar = multer({
  storage: avatarCloudinaryStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
});

export { uploadAvatar, uploadProductPhoto };
