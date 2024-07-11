import * as productsServices from "../services/productsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { updateProductSchema, createProductSchema, updateFavoriteSchema } from "../schemas/productsSchemas.js";
import { handleNotFound } from "../helpers/errorHandlers.js";
import cloudinary from "../middlewares/cloudinaryConfig.js";

export const getPublicProducts = ctrlWrapper(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const products = await productsServices.getPublicProducts(options);
  res.json(products);
});

export const getAllProducts = ctrlWrapper(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const currentUser = req.user;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const products = await productsServices.getAllProducts(currentUser._id, options);
  res.json(products);
});

export const getOneProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const oneProduct = await productsServices.getOneProduct(id, owner);
  if (!oneProduct) {
    return handleNotFound(req, res);
  }
  res.json(oneProduct);
});

export const deleteProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const deletedProduct = await productsServices.deleteProduct(id, owner);
  if (!deletedProduct) {
    return handleNotFound(req, res);
  }
  res.json(deletedProduct);
});

export const createProduct = ctrlWrapper(async (req, res) => {
  const { name, price, description, condition, PLZ, city, category, subcategory1, subcategory2, subcategory3 } = req.body;
  const owner = req.user._id;

  const uploadImages = async (files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path);
      uploadedUrls.push(result.secure_url);
    }
    return uploadedUrls;
  };

  const uploadedUrls = await uploadImages(req.files);

  const newProduct = {
    name,
    price,
    description,
    condition,
    PLZ,
    city,
    image1: uploadedUrls[0] || null,
    image2: uploadedUrls[1] || null,
    image3: uploadedUrls[2] || null,
    category,
    subcategory1,
    subcategory2,
    subcategory3,
    owner,
  };

  const productForValidation = { ...newProduct };
  delete productForValidation.owner;

  try {
    await createProductSchema.validateAsync(productForValidation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const result = await productsServices.createProduct(newProduct);
  res.status(201).json(result);
});

export const updateProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { _id: owner } = req.user;
  const options = { new: true };

  const uploadImages = async (files) => {
    const uploadedUrls = [];
    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.path);
      uploadedUrls.push(result.secure_url);
    }
    return uploadedUrls;
  };

  if (req.files.length > 0) {
    const uploadedUrls = await uploadImages(req.files);
    body.image1 = uploadedUrls[0] || null;
    body.image2 = uploadedUrls[1] || null;
    body.image3 = uploadedUrls[2] || null;
  }

  try {
    await updateProductSchema.validateAsync(body);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  if (!Object.keys(body).length) {
    return res.status(400).json({ message: "Body must have at least one field" });
  }

  const existingProduct = await productsServices.updateProduct(id, body, owner, options);
  if (!existingProduct) {
    return handleNotFound(req, res);
  }

  res.status(200).json(existingProduct);
});

export const updateStatusProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body;
  const { _id: owner } = req.user;
  const options = { new: true };

  try {
    await updateFavoriteSchema.validateAsync({ favorite });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const updatedFavorite = await productsServices.updateStatusProduct(id, { favorite }, owner, options);
  if (!updatedFavorite) {
    return handleNotFound(req, res);
  }

  res.status(200).json(updatedFavorite);
});
