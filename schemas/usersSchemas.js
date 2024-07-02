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
