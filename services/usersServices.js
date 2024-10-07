import User from "../models/userModel.js";

export const findUser = (filter) => User.findOne(filter);

export const signup = (data) => User.create(data);

export const updateUserById = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: false,
  });
};
