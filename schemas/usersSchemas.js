import Joi from "joi";

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
  plz: Joi.string().optional(),
  city: Joi.string().optional(),
  facebook: Joi.string().optional(),
  instagram: Joi.string().optional(),
  linkedin: Joi.string().optional(),
  telegram: Joi.string().optional(),
  about: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  newPassword: Joi.string().min(6).optional(),
  confirmPassword: Joi.any().valid(Joi.ref("newPassword")).when("newPassword", {
    is: Joi.exist(),
    then: Joi.required(),
  }),
});

export const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
});
