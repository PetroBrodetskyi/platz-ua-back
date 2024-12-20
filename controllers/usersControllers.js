import * as userServices from "../services/usersServices.js";
import bcrypt from "bcrypt";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";
import verificationEmail from "../helpers/verifyEmail.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../schemas/usersSchemas.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import gravatar from "gravatar";
import { nanoid } from "nanoid";

const { SECRET_KEY, BASE_URL } = process.env;

export const registerUser = ctrlWrapper(async (req, res) => {
  const { error } = registerUserSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  const { firstName, lastName, email, password, phone } = req.body;
  const fullName = `${firstName} ${lastName}`;

  const avatarURL = gravatar.url(email, {
    protocol: "https",
    s: "200",
    r: "pg",
    d: "identicon",
  });

  const existingUser = await userServices.findUser({ email });
  if (existingUser) {
    throw HttpError(409, "Email in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();

  const newUser = await userServices.signup({
    name: fullName,
    email,
    phone,
    password: hashedPassword,
    avatarURL,
    verificationToken,
    likes: 0,
  });

  const verifyEmail = {
    to: email,
    subject: "Підтвердження реєстрації на платформі PlatzUA",
    html: verificationEmail(verificationToken, BASE_URL),
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatar: newUser.avatarURL,
      verify: newUser.verify,
    },
  });
});

export const verifyEmail = ctrlWrapper(async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user || user.verify) {
    return res.redirect(`${process.env.FRONTEND_URL}/`);
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
});

export const loginUser = ctrlWrapper(async (req, res) => {
  const { error } = loginUserSchema.validate(req.body);
  if (error) {
    res.status(401).json({ message: error.message });
    return;
  }

  const { email, password } = req.body;

  const existingUser = await userServices.findUser({ email });
  if (!existingUser) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!existingUser.verify) {
    throw HttpError(401, "Email not verified");
  }

  const passwordCompare = await bcrypt.compare(password, existingUser.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: existingUser._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(existingUser._id, { token });

  res.status(200).json({
    token,
    user: {
      name: existingUser.name,
      email: existingUser.email,
      subscription: existingUser.subscription,
    },
  });
});

export const getCurrentUser = ctrlWrapper(async (req, res) => {
  const {
    _id,
    name,
    email,
    phone,
    subscription,
    avatarURL,
    likes,
    verify,
    plz,
    city,
    facebook,
    instagram,
    linkedin,
    telegram,
    site,
    about,
    following,
    followers,
  } = req.user;

  res.json({
    _id,
    name,
    email,
    phone,
    subscription,
    avatarURL,
    likes,
    verify,
    plz,
    city,
    facebook,
    instagram,
    linkedin,
    telegram,
    site,
    about,
    following,
    followers,
  });
});

export const updateUserDetails = async (req, res, next) => {
  try {
    const user = req.user._id;
    const currentUser = await User.findById(user);

    if (req.body.newPassword) {
      const isPasswordMatch = await bcrypt.compare(
        req.body.password,
        currentUser.password
      );
      if (!isPasswordMatch) {
        throw HttpError(401, "Current password is incorrect");
      }
      req.body.password = await bcrypt.hash(req.body.newPassword, 10);
      delete req.body.newPassword;
      delete req.body.confirmPassword;
    }

    if (req.file) {
      const { path } = req.file;

      if (currentUser.avatarPublicId) {
        await cloudinary.uploader.destroy(currentUser.avatarPublicId);
      }

      req.body.avatarURL = path;
      req.body.avatarPublicId = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(user, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getUserById = ctrlWrapper(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId)
    .select("-__v")
    .populate("likedUsers", "avatarURL")
    .populate("followers", "name avatarURL plz city")
    .populate("following", "name avatarURL plz city");

  if (!user) {
    throw HttpError(404, "User not found");
  }

  const hasPassword = !!user.password;
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  res.json({ ...userWithoutPassword, hasPassword });
});

export const logoutUser = ctrlWrapper(async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });

  res.status(204).json({ message: "No Content" });
});

export const updateLikes = ctrlWrapper(async (req, res) => {
  const { userId } = req.body;
  const { userId: ownerId } = req.params;

  if (!userId || !ownerId) {
    throw HttpError(400, "Missing userId or ownerId");
  }

  const owner = await User.findById(ownerId);

  if (!owner) {
    throw HttpError(404, "User not found");
  }

  if (owner.likedUsers.some((user) => user._id.toString() === userId)) {
    owner.likedUsers = owner.likedUsers.filter(
      (user) => user._id.toString() !== userId
    );
    owner.likes = owner.likedUsers.length;
  } else {
    owner.likedUsers.push(userId);
    owner.likes = owner.likedUsers.length;
  }

  await owner.save();

  res.status(200).json(owner);
});

export const updateUserSubscription = ctrlWrapper(async (req, res) => {
  const { subscription } = req.body;
  const validSubscriptions = ["starter", "pro", "business", "admin"];

  if (!validSubscriptions.includes(subscription)) {
    throw HttpError(400, "Invalid subscription type");
  }

  req.user.subscription = subscription;
  await req.user.save();

  res.json({
    message: "Subscription updated",
    subscription: req.user.subscription,
  });
});

export const followUser = ctrlWrapper(async (req, res) => {
  const userId = req.user._id;
  const targetUserId = req.params.id;

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) {
    return res.status(404).json({ message: "Користувач не знайдений" });
  }

  if (user.following.includes(targetUserId)) {
    return res
      .status(400)
      .json({ message: "Ви вже підписані на цього користувача" });
  }

  user.following.push(targetUserId);
  await user.save();

  targetUser.followers.push(userId);
  await targetUser.save();

  res.status(200).json({ message: "Ви успішно підписалися на користувача" });
});

export const unfollowUser = ctrlWrapper(async (req, res) => {
  const userId = req.user._id;
  const targetUserId = req.params.id;

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) {
    return res.status(404).json({ message: "Користувач не знайдений" });
  }

  await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });
  await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } });

  res.status(200).json({ message: "Ви відписалися від користувача" });
});
