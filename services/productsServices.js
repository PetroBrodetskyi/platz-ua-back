import Product from "../models/productModel.js";

export const getAllProducts = (owner, options) =>
  Product.find({ owner })
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

export const getUserProducts = (owner) => Product.find({ owner });

export const getOneProduct = (id, owner) => Product.findOne({ _id: id, owner });

export const deleteProduct = (id, owner) =>
  Product.findOneAndDelete({ _id: id, owner });

export const createProduct = (productData) => Product.create(productData);

export const updateProduct = (id, body, owner, options) =>
  Product.findOneAndUpdate({ _id: id, owner }, body, options);

export const updateStatusProduct = (id, body, owner, options) =>
  Product.findOneAndUpdate({ _id: id, owner }, body, options);

export const getPublicProducts = async (options) => {
  const { page, limit, filter } = options;

  const query = {};

  if (filter && filter.PLZ) {
    query.PLZ = filter.PLZ;
  }

  if (filter && filter.city) {
    query.city = filter.city;
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return products;
};

export const getProductsByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const products = await Product.find({ _id: { $in: ids } });
  return products;
};

export const getProductsByCategory = (options) =>
  Product.find({ category: options.category })
    .skip((options.page - 1) * options.limit)
    .limit(options.limit);

export const getOnePublicProduct = async (id) => {
  const product = await Product.findById(id);
  if (product) {
    product.views = (product.views || 0) + 1;
    await product.save();
  }
  return product;
};

export const addComment = async (id, commentData) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  product.comments.push(commentData);
  await product.save();
  return product;
};

export const getComments = async (id) => {
  const product = await Product.findById(id)
    .populate("comments.user")
    .populate("comments.replies.user");
  if (!product) {
    throw new Error("Product not found");
  }
  return product.comments;
};

export const deleteComment = async (id, commentId, userId) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  const commentIndex = product.comments.findIndex(
    (comment) => comment._id.toString() === commentId
  );
  if (commentIndex === -1) {
    throw new Error("Comment not found");
  }

  if (product.comments[commentIndex].user.toString() !== userId.toString()) {
    throw new Error("Not authorized to delete this comment");
  }

  product.comments.splice(commentIndex, 1);
  await product.save();

  return product;
};

export const addReply = async (id, commentId, replyData) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  const comment = product.comments.id(commentId);
  if (!comment) {
    throw new Error("Comment not found");
  }

  comment.replies.push(replyData);
  await product.save();
  return product;
};

export const editReply = async (id, replyId, text, user) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  const comment = product.comments.find((c) => c.replies.id(replyId));
  if (!comment) {
    throw new Error("Comment or Reply not found");
  }

  const reply = comment.replies.id(replyId);
  if (!reply) {
    throw new Error("Reply not found");
  }

  if (reply.user.toString() !== user.toString()) {
    throw new Error("Unauthorized action");
  }

  reply.text = text;
  await product.save();
  return product;
};
