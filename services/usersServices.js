import User from "../models/userModel.js";

export const findUser = filter => User.findOne(filter);

export const signup = data => User.create(data);