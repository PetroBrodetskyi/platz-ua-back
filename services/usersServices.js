import User from "../models/userModel.js";

export const findUser = (filter) => User.findOne(filter);

export const signup = (data) => User.create(data);

export const findUserByRefreshToken = async (refreshToken) => {
  return User.findOne({ refreshToken });
};

export const updateUserById = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: false,
  });
};

export const getProductsByIds = async (ids) => {
  return await Product.find({ userId: { $in: ids } });
};
