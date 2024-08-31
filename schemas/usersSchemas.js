import Joi from "joi";

export const registerUserSchema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const emailSchema = Joi.object({
    email: Joi.string().email().required(),
})

export const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const updateUserSchema = Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    avatar: Joi.any().optional(),
    likes: Joi.number().integer().min(0).optional()
});
