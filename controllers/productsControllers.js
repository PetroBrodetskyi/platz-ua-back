import * as productsServices from "../services/productsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import {
  updateProductSchema,
  createProductSchema,
  updateFavoriteSchema,
} from "../schemas/productsSchemas.js";
import { handleNotFound } from "../helpers/errorHandlers.js";
import cloudinary from "../middlewares/cloudinaryConfig.js";

const getPaginationOptions = (page, limit, all) => ({
  page: parseInt(page, 10) || 1,
  limit: all ? Infinity : parseInt(limit, 10) || 6,
});

const buildProductFilter = ({ PLZ, city, category, subcategories }) => {
  const filter = {};

  if (PLZ) filter.PLZ = PLZ.trim();
  if (city) filter.city = city.trim();
  if (category) filter.category = category.trim();

  if (subcategories) {
    subcategories.forEach((subcategory, index) => {
      if (subcategory) {
        filter[`subcategory${index + 1}`] = subcategory.trim();
      }
    });
  }

  return filter;
};

export const getPublicProducts = ctrlWrapper(async (req, res) => {
  const { page, limit, PLZ, city, all } = req.query;

  const options = getPaginationOptions(page, limit, all);
  options.filter = buildProductFilter({ PLZ, city });

  const products = await productsServices.getPublicProducts(options);
  res.json(products);
});

export const getProductsByCategory = ctrlWrapper(async (req, res) => {
  const { category, subcategory1, subcategory2, subcategory3, subcategory4 } =
    req.query;
  const { page, limit } = req.query;

  if (!category) {
    return res.status(400).json({ message: "Category parameter is required" });
  }

  const subcategories = [
    subcategory1,
    subcategory2,
    subcategory3,
    subcategory4,
  ];
  const filter = buildProductFilter({ category, subcategories });

  const options = getPaginationOptions(page, limit);

  try {
    const products = await productsServices.getProductsByCategory({
      ...options,
      filter,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products by category",
      error: error.message,
    });
  }
});

export const getAllProducts = ctrlWrapper(async (req, res) => {
  const { page, limit } = req.query;
  const currentUser = req.user;

  const options = getPaginationOptions(page, limit);
  const products = await productsServices.getAllProducts(
    currentUser._id,
    options
  );
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
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(onePublicProduct);
});

export const deleteProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  const product = await productsServices.getOneProduct(id, owner);
  if (!product) {
    return handleNotFound(req, res);
  }

  const images = [
    product.image1,
    product.image2,
    product.image3,
    product.image4,
  ].filter(Boolean);
  const deleteImagesPromises = images.map(async (url) => {
    try {
      const publicId = url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_photos/${publicId}`);
    } catch (error) {
      console.error(`Failed to delete image: ${url}`, error.message);
    }
  });

  await Promise.all(deleteImagesPromises);
  const deletedProduct = await productsServices.deleteProduct(id, owner);
  if (!deletedProduct) {
    return handleNotFound(req, res);
  }

  res.json({ message: "Product deleted successfully", deletedProduct });
});

export const createProduct = ctrlWrapper(async (req, res) => {
  const {
    name,
    price,
    description,
    condition,
    PLZ,
    city,
    category,
    subcategory1,
    subcategory2,
    subcategory3,
  } = req.body;

  const owner = req.user._id;
  const uploadedUrls = req.files.map((file) => file.path);

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
    return res
      .status(400)
      .json({ message: "Body must have at least one field" });
  }

  const existingProduct = await productsServices.updateProduct(
    id,
    body,
    owner,
    options
  );
  if (!existingProduct) {
    return handleNotFound(req, res);
  }

  res.status(200).json(existingProduct);
});

export const updateUserProduct = ctrlWrapper(async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const { _id: userId, subscription } = req.user;
  const options = { new: true };

  const owner = subscription === "admin" ? null : userId;

  try {
    await updateProductSchema.validateAsync(body);

    if (!Object.keys(body).length) {
      return res
        .status(400)
        .json({ message: "Body must have at least one field" });
    }

    const updatedUserProduct = await productsServices.updateProduct(
      id,
      body,
      owner,
      options
    );
    if (!updatedUserProduct) {
      return handleNotFound(req, res);
    }

    res.status(200).json(updatedUserProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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

  const updatedFavorite = await productsServices.updateStatusProduct(
    id,
    { favorite },
    owner,
    options
  );
  if (!updatedFavorite) {
    return handleNotFound(req, res);
  }

  res.status(200).json(updatedFavorite);
});
