import Product from "../models/productModel.js";

export const getAllProducts = (owner, options) => Product.find({ owner }).skip((options.page - 1) * options.limit).limit(options.limit);

export const getOneProduct = (id, owner) => Product.findOne({ _id: id, owner });

export const deleteProduct = (id, owner) => Product.findOneAndDelete({ _id: id, owner });

export const createProduct = (productData) => Product.create(productData);

export const updateProduct = (id, body, owner, options) => Product.findOneAndUpdate({ _id: id, owner }, body, options);

export const updateStatusProduct = (id, body, owner, options) => Product.findOneAndUpdate({ _id: id, owner }, body, options);

export const getPublicProducts = (options) => Product.find().skip((options.page - 1) * options.limit).limit(options.limit);