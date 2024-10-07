import * as userServices from "../services/usersServices.js";
import * as productsServices from "../services/productsServices.js";
import ctrlWrapper from "../helpers/ctrlWrapper.js";
import { handleNotFound } from "../helpers/errorHandlers.js";

export const addToCart = ctrlWrapper(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const product = await productsServices.getOnePublicProduct(productId);
  if (!product) {
    return handleNotFound(req, res);
  }

  const user = await userServices.findUser(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.cart.includes(productId.toString())) {
    await userServices.updateUserById(userId, {
      $addToSet: { cart: productId.toString() },
    });
  }

  res.status(200).json({ message: "Product added to cart", cart: user.cart });
});

export const removeFromCart = ctrlWrapper(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const user = await userServices.findUser(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.cart.includes(productId.toString())) {
    await userServices.updateUserById(userId, {
      $pull: { cart: productId.toString() },
    });
  } else {
    return res.status(404).json({ message: "Product not found in cart" });
  }

  res
    .status(200)
    .json({ message: "Product removed from cart", cart: user.cart });
});
