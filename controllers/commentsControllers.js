import * as productsServices from "../services/productsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";

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
  try {
    const { id, commentId } = req.params;
    const updatedProduct = await productsServices.deleteComment(
      id,
      commentId,
      req.user.id
    );
    res.status(200).json({ message: "Comment deleted", updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export const addReply = async (req, res) => {
  const { id, commentId } = req.params;
  const replyData = req.body;

  try {
    const product = await productsServices.addReply(id, commentId, replyData);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const editReply = ctrlWrapper(async (req, res) => {
  const { id, replyId } = req.params;
  const { text } = req.body;
  const userId = req.user._id;

  const updatedProduct = await productsServices.editReply(
    id,
    replyId,
    text,
    userId
  );
  res.status(200).json(updatedProduct);
});
