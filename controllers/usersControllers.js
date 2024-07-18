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
import cloudinary from "../middlewares/cloudinaryConfig.js";
import { uploadAvatar } from "../middlewares/uploadConfig.js";
import multer from 'multer';

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

    await User.findByIdAndUpdate(user._id, {verify: true, verificationToken: null});

    res.redirect(`${process.env.FRONTEND_URL}/`);
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
            email: existingUser.email,
            subscription: existingUser.subscription,
        }
    });
});

export const getCurrentUser = ctrlWrapper(async (req, res) => {
    const { name, email, phone, subscription, avatarURL } = req.user;

    res.json({
        name,
        email,
        phone,
        subscription,
        avatarURL,
    });
});

export const updateUserDetails = ctrlWrapper(async (req, res) => {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.message });
    }
    
    const { user } = req;
    const { name, phone, email } = req.body;

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        user.avatarURL = result.secure_url;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (email) user.email = email;

    await user.save();

    res.json({
        name: user.name,
        phone: user.phone,
        email: user.email,
        avatarURL: user.avatarURL
    });
});

export const getUserById = ctrlWrapper(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -__v -createdAt -updatedAt');
    
    if (!user) {
        throw HttpError(404, 'User not found');
    }

    res.json(user);
});

export const updateAvatar = async (req, res) => {
    try {
        const { user } = req;
        const { avatar } = req.body;

        user.avatarURL = avatar;
        await user.save();

        res.json({ avatarURL: user.avatarURL });
    } catch (error) {
        console.error(error);
        throw new HttpError(500, "Failed to update avatar");
    }
};

export const logoutUser = ctrlWrapper(async(req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: null });

    res.status(204).json({ message: "No Content" });
});

export const uploadAvatarHandler = async (req, res) => {
    try {
        uploadAvatar.single("avatar")(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(500).json({ message: "Server Error" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const result = await cloudinary.uploader.upload(req.file.path);

            req.user.avatarURL = result.secure_url;
            await req.user.save();

            return res.json({ avatarURL: req.user.avatarURL });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to upload avatar" });
    }
};

export const likeUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Before update: ${user.likes}`);
    
    user.likes += 1;
    await user.save();

    console.log(`After update: ${user.likes}`);
    
    res.status(200).json({ likes: user.likes });
  } catch (error) {
    console.error("Error adding like:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const unlikeUser = ctrlWrapper(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
        throw HttpError(404, "User not found");
    }

    user.likes = Math.max(user.likes - 1, 0);
    await user.save();

    res.json({ likes: user.likes });
});
