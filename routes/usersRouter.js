import express from "express";
import validateBody from "../helpers/validateBody.js";
import { registerUserSchema, emailSchema, loginUserSchema } from "../schemas/usersSchemas.js";
import { registerUser, loginUser, getCurrentUser, logoutUser, uploadAvatarHandler, verifyEmail, resendVerifyEmail } from "../controllers/usersControllers.js";
import { authenticate } from "../middlewares/authenticate.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(registerUserSchema), registerUser);

usersRouter.get("/verify/:verificationToken", verifyEmail);

usersRouter.post("/verify", validateBody(emailSchema), resendVerifyEmail);

usersRouter.post("/login", validateBody(loginUserSchema), loginUser);

usersRouter.get("/current", authenticate, getCurrentUser);

usersRouter.patch("/avatars", authenticate, uploadAvatarHandler);

usersRouter.post("/logout", authenticate, logoutUser);

export default usersRouter;
