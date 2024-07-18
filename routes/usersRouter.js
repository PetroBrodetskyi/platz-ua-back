import express from "express";
import validateBody from "../helpers/validateBody.js";
import { registerUserSchema, emailSchema, loginUserSchema, updateUserSchema } from "../schemas/usersSchemas.js";
import { registerUser, loginUser, getCurrentUser, logoutUser, uploadAvatarHandler, verifyEmail, resendVerifyEmail, getUserById, likeUser, unlikeUser, updateUserDetails } from "../controllers/usersControllers.js";
import { authenticate } from "../middlewares/authenticate.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(registerUserSchema), registerUser);

usersRouter.get("/verify/:verificationToken", verifyEmail);

usersRouter.post("/verify", validateBody(emailSchema), resendVerifyEmail);

usersRouter.post("/login", validateBody(loginUserSchema), loginUser);

usersRouter.get("/current", authenticate, getCurrentUser);

usersRouter.patch("/current", authenticate, validateBody(updateUserSchema), updateUserDetails);

usersRouter.patch("/avatars", authenticate, uploadAvatarHandler);

usersRouter.post("/logout", authenticate, logoutUser);

usersRouter.get("/:userId", getUserById);

usersRouter.patch("/:userId/like", getUserById, likeUser);

usersRouter.patch("/:userId/unlike", getUserById, unlikeUser);

export default usersRouter;
