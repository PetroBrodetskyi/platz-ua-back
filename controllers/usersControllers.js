import * as userServices from "../services/usersServices.js";
import bcrypt from "bcrypt";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";
import { registerUserSchema, loginUserSchema, updateUserSchema } from "../schemas/usersSchemas.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import gravatar from 'gravatar';
import { nanoid } from "nanoid";


const { SECRET_KEY, BASE_URL } = process.env;

export const registerUser = ctrlWrapper(async (req, res) => {
    const { error } = registerUserSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const { email, password, name, phone } = req.body;

    const avatarURL = gravatar.url(email, { protocol: 'https', s: '200', r: 'pg', d: 'identicon' });

    const existingUser = await userServices.findUser({ email });
    if (existingUser) {
        throw HttpError(409, "Email in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();

    const newUser = await userServices.signup({
        name,
        email,
        phone,
        password: hashedPassword,
        avatarURL,
        verificationToken,
        likes: 0,
    });

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
        user: {
            email: newUser.email,
            subscription: newUser.subscription,
            avatar: newUser.avatarURL,
        }
    });
});

export const verifyEmail = ctrlWrapper(async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
        throw HttpError(404, "Email not found");
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

    res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
});


export const resendVerifyEmail = ctrlWrapper(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "missing required field email" });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
        throw HttpError(401, "Email not found");
    }

    if (user.verify) {
        throw HttpError(400, "Verification has already been passed");
    }

    if (user.verifiedEmailSent) {
        throw HttpError(400, "Verification email already sent");
    }

    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);
    await User.findByIdAndUpdate(user._id, {verify: true, verifiedEmailSent: true });

    res.status(200).json({ message: "Verification email sent" });
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
        }
    });
});

export const getCurrentUser = ctrlWrapper(async (req, res) => {
    const { _id, name, email, phone, subscription, avatarURL, likes } = req.user;

    res.json({
        _id,
        name,
        email,
        phone,
        subscription,
        avatarURL,
        likes,
    });
});

// export const updateUserDetails = async (req, res, next) => {
//   try {
//     const user = req.user._id;

//     if (req.file) {
//       const { path } = req.file;
//       req.body.avatarURL = path;
//     }

//     const updatedUser = await User.findByIdAndUpdate(user, req.body, { new: true, runValidators: true });
//     res.json(updatedUser);
//   } catch (error) {
//     next(error);
//   }
// };

export const updateUserDetails = async (req, res, next) => {
  try {
    const user = req.user._id;

    if (req.file) {
      const { path: newAvatarURL, filename: newAvatarPublicId } = req.file;

      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }

      user.avatarURL = newAvatarURL;
      user.avatarPublicId = newAvatarPublicId;
    }

    const updatedUser = await User.findByIdAndUpdate(user, req.body, { new: true, runValidators: true });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};


export const getUserById = ctrlWrapper(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId)
        .select('-password -__v')
        .populate('likedUsers', 'avatarURL');;
    
    if (!user) {
        throw HttpError(404, 'User not found');
    }

    res.json(user);
});

export const logoutUser = ctrlWrapper(async(req, res) => {
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

  if (owner.likedUsers.some(user => user._id.toString() === userId)) {
    owner.likedUsers = owner.likedUsers.filter(user => user._id.toString() !== userId);
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
    
    res.json({ message: "Subscription updated", subscription: req.user.subscription });
});
