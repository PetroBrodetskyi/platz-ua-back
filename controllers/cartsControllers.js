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
    user.cart.push(productId.toString());
    await user.save();
  }

  res.status(200).json({ message: "Product added to cart", cart: user.cart });
});

export const removeFromCart = ctrlWrapper(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const user = await userServices.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.cart.includes(productId.toString())) {
    user.cart = user.cart.filter((id) => id.toString() !== productId);
    await user.save();
    return res
      .status(200)
      .json({ message: "Product removed from cart", cart: user.cart });
  } else {
    return res.status(404).json({ message: "Product not found in cart" });
  }
});
