import * as userServices from "../services/usersServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}

export const googleAuth = ctrlWrapper(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw HttpError(400, '"token" is required');
  }

  let payload;
  try {
    payload = await verify(token);
  } catch (error) {
    throw HttpError(401, "Invalid token");
  }

  const { name, email, picture } = payload;

  let user = await userServices.findUser({ email });

  if (!user) {
    user = await userServices.signup({
      name,
      email,
      avatarURL: picture,
      password: null,
      phone: null,
      verificationToken: null,
      likes: 0,
      verify: true,
    });
  }

  const jwtToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "23h",
  });

  await userServices.updateUserById(user._id, { token: jwtToken });

  res.status(200).json({
    token: jwtToken,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatarURL,
      password: user.password,
    },
  });
});
