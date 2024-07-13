import express from "express";
import {
  getPublicProducts,
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
import { uploadProductPhoto } from '../middlewares/uploadConfig.js';

const productsRouter = express.Router();

productsRouter.get('/public', getPublicProducts);

productsRouter.get("/", authenticate, getAllProducts);

productsRouter.get("/:id", authenticate, validateId, getOneProduct);

productsRouter.delete("/:id", authenticate, validateId, deleteProduct);

productsRouter.post("/", authenticate, uploadProductPhoto.array('image'), validateBody(createProductSchema), createProduct);

productsRouter.put("/:id", authenticate, validateId, uploadProductPhoto.array('image', 4), validateBody(updateProductSchema), updateProduct);

productsRouter.patch("/:id/favorite", authenticate, validateId, validateBody(updateFavoriteSchema), updateStatusProduct);

export default productsRouter;
