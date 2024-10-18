import Joi from "joi";

export const googleAuthSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  avatarURL: Joi.string().uri().required(),
});

export const registerUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required(),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  avatar: Joi.any().optional(),
  likes: Joi.number().integer().min(0).optional(),
});

export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
});
