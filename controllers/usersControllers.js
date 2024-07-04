import * as userServices from "../servises/usersServices.js";
import bcrypt from "bcrypt";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";
import { registerUserSchema, loginUserSchema } from "../schemas/usersSchemas.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import gravatar from 'gravatar';
import path from 'path';
import fs from 'fs/promises';
import jimp from 'jimp';
import upload from "../middlewares/upload.js";
import multer from 'multer';
import { nanoid } from "nanoid";

const { SECRET_KEY, BASE_URL } = process.env;
const AVATARS_DIR = path.resolve("public/avatars");

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
        html: `<a target="_blank" href="${BASE_URL}/verify-email?token=${verificationToken}">Click verify email</a>`
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

    res.redirect(`${process.env.FRONTEND_URL}/auth/login?message=Email%20successfully%20verified`);
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
        html: `<a target="_blank" href="${BASE_URL}/verify-email?token=${user.verificationToken}">Click verify email</a>`
    };

    await sendEmail(verifyEmail);
    await User.findByIdAndUpdate(user._id, { verify: true, verifiedEmailSent: true });

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
    const { email, subscription } = req.user;

    res.json({
        email,
        subscription,
    });
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

export const uploadAvatar = async (req, res) => {
    try {
        upload.single("avatar")(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(500).json({ message: "Server Error" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const tempFilePath = req.file.path;

            try {
                const image = await jimp.read(tempFilePath);
                image.resize(250, 250);

                const uniqueFileName = req.file.filename;

                const newAvatarPath = path.join(AVATARS_DIR, uniqueFileName);

                await image.writeAsync(newAvatarPath);

                req.user.avatarURL = `/avatars/${uniqueFileName}`;
                await req.user.save();

                await fs.unlink(tempFilePath);

                return res.json({ avatarURL: req.user.avatarURL });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Failed to update avatar" });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to upload avatar" });
    }
};
