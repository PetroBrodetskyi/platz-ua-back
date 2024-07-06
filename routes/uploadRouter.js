import express from 'express';
import cloudinary from '../cloudinaryConfig.js';
import { uploadProductPhoto } from '../middlewares/uploadConfig.js';
import ctrlWrapper from '../helpers/ctrlWrapper.js';

const router = express.Router();

const uploadImages = ctrlWrapper(async (req, res) => {
  const uploadPromises = req.files.map((file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      });
      uploadStream.end(file.buffer);
    });
  });

  try {
    const urls = await Promise.all(uploadPromises);
    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/upload', uploadProductPhoto.array('images', 3), uploadImages); // використовуємо новий middleware

export default router;
