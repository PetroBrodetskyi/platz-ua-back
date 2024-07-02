import * as productsServices from "../servises/productsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { updateProductSchema } from "../schemas/productsSchemas.js";
import { handleNotFound } from "../helpers/errorHandlers.js";

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
  const { name, price, description, condition, location, favorite, gallery, views, category } = req.body;
  const owner = req.user._id;
  const result = await productsServices.createProduct({ name, price, description, condition, location, favorite, gallery, views, category, owner });
  res.status(201).json(result);
});

export const updateProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { _id: owner } = req.user;
  const options = { new: true };

  const existingProduct = await productsServices.updateProduct(id, body, owner);
  if (!existingProduct) {
    return handleNotFound(req, res);
  }

  try {
    await updateProductSchema.validateAsync(body);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  if (!Object.keys(body).length) {
    return res.status(400).json({ message: "Body must have at least one field" });
  }

  const updatedProduct = await productsServices.updateProduct(id, body, owner, options);
  res.status(200).json(updatedProduct);
});

export const updateStatusProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { favorite } = req.body;
  const { _id: owner } = req.user;
  const options = { new: true };

  const updatedFavorite = await productsServices.updateStatusProduct(id, { favorite }, owner, options);
  if (!updatedFavorite) {
    return handleNotFound(req, res);
  }

  res.status(200).json(updatedFavorite);
});
