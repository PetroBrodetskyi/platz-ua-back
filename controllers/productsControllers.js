import * as productsServices from "../services/productsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { updateProductSchema, createProductSchema, updateFavoriteSchema } from "../schemas/productsSchemas.js";
import { handleNotFound } from "../helpers/errorHandlers.js";
import cloudinary from "../middlewares/cloudinaryConfig.js";

export const getPublicProducts = ctrlWrapper(async (req, res) => {
  const { page = 1, limit = 8, PLZ, city } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    filter: {}
  };

  if (PLZ) options.filter.PLZ = PLZ.trim();
  if (city) options.filter.city = city.trim();

  const products = await productsServices.getPublicProducts(options);
  res.json(products);
});


export const getProductsByCategory = ctrlWrapper(async (req, res) => {
  const { category } = req.query;
  const { page = 1, limit = 60 } = req.query;

  if (!category) {
    return res.status(400).json({ message: "Category parameter is required" });
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    category,
  };

  try {
    const products = await productsServices.getProductsByCategory(options);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export const getAllProducts = ctrlWrapper(async (req, res) => {
  const { page = 1, limit = 60 } = req.query;
  const currentUser = req.user;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10)
  };

  const products = await productsServices.getAllProducts(currentUser._id, options);
  res.json(products);
});

export const getUserProducts = ctrlWrapper(async (req, res) => {
  const { userId } = req.params;
  const usersProducts = await productsServices.getUserProducts(userId);
  res.status(200).json(usersProducts);
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

export const getOnePublicProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const onePublicProduct = await productsServices.getOnePublicProduct(id);
  if (!onePublicProduct) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(onePublicProduct);
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

  const uploadedUrls = req.files.map(file => file.path);

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
    image4: uploadedUrls[3] || null,
    category,
    subcategory1,
    subcategory2: subcategory2 || null,
    subcategory3: subcategory3 || null,
    owner,
  };

  if (newProduct.subcategory2 === null) {
    delete newProduct.subcategory2;
  }
  if (newProduct.subcategory3 === null) {
    delete newProduct.subcategory3;
  }

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
    body.image4 = uploadedUrls[3] || null;
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

export const updateUserProduct = ctrlWrapper(async (req, res) => {
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

  const updatedUserProduct = await productsServices.updateProduct(id, body, owner, options);

  res.status(200).json(updatedUserProduct);
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

export const addComment = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const newComment = {
    text,
    user: userId,
  };

  const updatedProduct = await productsServices.addComment(id, newComment);
  res.status(201).json(updatedProduct);
});

export const getComments = ctrlWrapper(async (req, res) => {
  const { id } = req.params;

  const comments = await productsServices.getComments(id);
  res.status(200).json(comments);
});

export const deleteComment = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const updatedProduct = await productsServices.deleteComment( id, userId);
  res.status(200).json({ message: 'Comment deleted', updatedProduct });
});

export const addReply = ctrlWrapper(async (req, res) => {
  const { id, commentId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const newReply = {
    text,
    user: userId,
  };

  const updatedProduct = await productsServices.addReply(id, commentId, newReply);
  res.status(201).json(updatedProduct);
});

export const editReply = ctrlWrapper(async (req, res) => {
  const { id, replyId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const updatedProduct = await productsServices.editReply(id, replyId, text, userId);
  res.status(200).json(updatedProduct);
});
