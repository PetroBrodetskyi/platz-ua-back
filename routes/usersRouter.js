import express from "express";
import validateBody from "../helpers/validateBody.js";
import {
  registerUserSchema,
  emailSchema,
  loginUserSchema,
  updateUserSchema,
  addToCartSchema,
} from "../schemas/usersSchemas.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  verifyEmail,
  getUserById,
  updateLikes,
  updateUserDetails,
  followUser,
  unfollowUser,
} from "../controllers/usersControllers.js";
import {
  addToCart,
  removeFromCart,
  getProductsInCart,
} from "../controllers/cartsControllers.js";
import { googleAuth } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadAvatar } from "../middlewares/uploadConfig.js";
import isAdmin from "../helpers/isAdmin.js";

const usersRouter = express.Router();
const adminRouter = express.Router();

usersRouter.post("/google-auth", googleAuth);
usersRouter.post("/register", validateBody(registerUserSchema), registerUser);
usersRouter.get("/verify/:verificationToken", verifyEmail);
usersRouter.post("/login", validateBody(loginUserSchema), loginUser);
usersRouter.get("/current", authenticate, getCurrentUser);

usersRouter.patch(
  "/current",
  authenticate,
  uploadAvatar.single("avatar"),
  validateBody(updateUserSchema),
  updateUserDetails
);

usersRouter.patch(
  "/cart",
  authenticate,
  validateBody(addToCartSchema),
  addToCart
);
usersRouter.delete("/cart/:productId", authenticate, removeFromCart);
usersRouter.get("/cart", authenticate, getProductsInCart);
usersRouter.post("/logout", authenticate, logoutUser);
usersRouter.get("/:userId", authenticate, getUserById);
usersRouter.patch("/:userId/likes", authenticate, updateLikes);
usersRouter.patch("/:id/follow", authenticate, followUser);
usersRouter.patch("/:id/unfollow", authenticate, unfollowUser);

adminRouter.get("/admin", authenticate, isAdmin);

export { usersRouter, adminRouter };
