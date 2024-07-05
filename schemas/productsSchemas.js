import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.string().required(),
  description: Joi.string().required(),
  condition: Joi.string().required(),
  location: Joi.object({
    PLZ: Joi.string().required(),
    city: Joi.string().required(),
  }).required(),
  favorite: Joi.boolean().optional(),
  image1: Joi.string().optional(),
  image2: Joi.string().optional(),
  image3: Joi.string().optional(),
  views: Joi.string().optional(),
  category: Joi.object({
    subcategory1: Joi.string().optional(),
    subcategory2: Joi.string().optional(),
    subcategory3: Joi.string().optional(),
  }).optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  price: Joi.string().optional(),
  description: Joi.string().optional(),
  condition: Joi.string().optional(),
  location: Joi.object({
    PLZ: Joi.string().optional(),
    city: Joi.string().optional(),
  }).optional(),
  favorite: Joi.boolean().optional(),
  image1: Joi.string().optional(),
  image2: Joi.string().optional(),
  image3: Joi.string().optional(),
  views: Joi.string().optional(),
  category: Joi.object({
    subcategory1: Joi.string().optional(),
    subcategory2: Joi.string().optional(),
    subcategory3: Joi.string().optional(),
  }).optional(),
});

export const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});
