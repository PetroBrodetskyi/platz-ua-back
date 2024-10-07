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
  resendVerifyEmail,
  getUserById,
  updateLikes,
  updateUserDetails,
} from "../controllers/usersControllers.js";
import { addToCart, removeFromCart } from "../controllers/cartsControllers.js";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadAvatar } from "../middlewares/uploadConfig.js";
import isAdmin from "../helpers/isAdmin.js";

const usersRouter = express.Router();
const adminRouter = express.Router();

usersRouter.post("/register", validateBody(registerUserSchema), registerUser);
usersRouter.get("/verify/:verificationToken", verifyEmail);
usersRouter.post("/verify", validateBody(emailSchema), resendVerifyEmail);
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
usersRouter.delete("/cart", authenticate, removeFromCart);
usersRouter.post("/logout", authenticate, logoutUser);
usersRouter.get("/:userId", getUserById);
usersRouter.patch("/:userId/likes", authenticate, updateLikes);

adminRouter.get("/admin", authenticate, isAdmin);

export { usersRouter, adminRouter };
