import express from "express";
import { uploadProductPhoto } from "../middlewares/uploadConfig.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";

const router = express.Router();

const uploadImages = ctrlWrapper(async (req, res) => {
  try {
    const urls = req.files.map((file) => file.path);
    res.status(200).json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/upload", uploadProductPhoto.array("image", 4), uploadImages);

export default router;
