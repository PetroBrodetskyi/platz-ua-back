import express from "express";
import {
  getPublicProducts,
  getAllProducts,
  getUserProducts,
  getOneProduct,
  deleteProduct,
  createProduct,
  updateProduct,
  updateUserProduct,
  updateStatusProduct,
  getProductsByCategory,
  getOnePublicProduct,
} from "../controllers/productsControllers.js";

import {
  addComment,
  getComments,
  deleteComment,
  addReply,
  editReply,
  deleteReply,
} from "../controllers/commentsControllers.js";

import validateBody from "../helpers/validateBody.js";
import {
  createProductSchema,
  updateProductSchema,
  updateFavoriteSchema,
} from "../schemas/productsSchemas.js";
import { validateId } from "../middlewares/idValidator.js";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadProductPhoto } from "../middlewares/uploadConfig.js";

const productsRouter = express.Router();

productsRouter.get("/public", getPublicProducts);

productsRouter.get("/public/category", getProductsByCategory);

productsRouter.get("/", authenticate, getAllProducts);

productsRouter.get("/user/:userId", getUserProducts);

productsRouter.get("/:id", authenticate, validateId, getOneProduct);

productsRouter.get("/public/:id", validateId, getOnePublicProduct);

productsRouter.delete("/:id", authenticate, validateId, deleteProduct);

productsRouter.post(
  "/",
  authenticate,
  uploadProductPhoto.array("image"),
  validateBody(createProductSchema),
  createProduct
);

productsRouter.put(
  "/:id",
  authenticate,
  validateId,
  uploadProductPhoto.array("image", 4),
  validateBody(updateProductSchema),
  updateProduct
);

productsRouter.patch(
  "/:id",
  authenticate,
  validateId,
  validateBody(updateProductSchema),
  updateUserProduct
);

productsRouter.patch(
  "/:id/favorite",
  authenticate,
  validateId,
  validateBody(updateFavoriteSchema),
  updateStatusProduct
);

productsRouter.patch("/:id/comments", authenticate, addComment);

productsRouter.get("/:id/comments", getComments);

productsRouter.delete("/:id/comments/:commentId", authenticate, deleteComment);

productsRouter.patch(
  "/:id/comments/:commentId/replies",
  authenticate,
  addReply
);

productsRouter.patch("/:id/replies/:replyId", authenticate, editReply);

productsRouter.delete(
  "/:id/comments/:commentId/replies/:replyId",
  authenticate,
  deleteReply
);

export default productsRouter;
