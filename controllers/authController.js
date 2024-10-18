import * as userServices from "../services/usersServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { googleRegisterSchema } from "../schemas/usersSchemas.js";
import jwt from "jsonwebtoken";

export const googleAuth = ctrlWrapper(async (req, res) => {
  const { error } = googleRegisterSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }

  const { name, email, avatarURL } = req.body;

  let user = await userServices.findUser({ email });

  if (!user) {
    user = await userServices.signup({
      name,
      email,
      avatarURL,
      likes: 0,
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "23h",
  });

  await userServices.updateUserById(user._id, { token });

  res.status(200).json({
    token,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatarURL,
    },
  });
});
