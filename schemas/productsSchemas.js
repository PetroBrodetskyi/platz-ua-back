import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.string().required(),
  description: Joi.string().required(),
  condition: Joi.string().required(),
  PLZ: Joi.string().required(),
  city: Joi.string().required(),
  favorite: Joi.boolean().optional(),
  image1: Joi.any().optional(),
  image2: Joi.any().optional(),
  image3: Joi.any().optional(),
  image4: Joi.any().optional(),
  views: Joi.string().optional(),
  category: Joi.object({
    main: Joi.string().required(),
    subcategories: Joi.array().items(Joi.string()).min(1).required(),
  }).required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  price: Joi.string().optional(),
  description: Joi.string().optional(),
  condition: Joi.string().optional(),
  PLZ: Joi.string().optional(),
  city: Joi.string().optional(),
  favorite: Joi.boolean().optional(),
  image1: Joi.any().optional(),
  image2: Joi.any().optional(),
  image3: Joi.any().optional(),
  image4: Joi.any().optional(),
  views: Joi.string().optional(),
  category: Joi.object({
    main: Joi.string().optional(),
    subcategories: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  status: Joi.string().optional(),
});

export const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
