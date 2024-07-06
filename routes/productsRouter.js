import express from "express";
import {
  getAllProducts,
  getOneProduct,
  deleteProduct,
  createProduct,
  updateProduct,
  updateStatusProduct,
} from "../controllers/productsControllers.js";

import validateBody from "../helpers/validateBody.js";
import { createProductSchema, updateProductSchema, updateFavoriteSchema } from "../schemas/productsSchemas.js";
import { validateId } from "../middlewares/idValidator.js";
import { authenticate } from "../middlewares/authenticate.js";
import upload from '../multerConfig.js';

const productsRouter = express.Router();

productsRouter.get("/", authenticate, getAllProducts);

productsRouter.get("/:id", authenticate, validateId, getOneProduct);

productsRouter.delete("/:id", authenticate, validateId, deleteProduct);

productsRouter.post("/", authenticate, upload.array('images', 3), validateBody(createProductSchema), createProduct);

productsRouter.put("/:id", authenticate, validateId, upload.array('images', 3), validateBody(updateProductSchema), updateProduct);

productsRouter.patch("/:id/favorite", authenticate, validateId, validateBody(updateFavoriteSchema), updateStatusProduct);

export default productsRouter;
