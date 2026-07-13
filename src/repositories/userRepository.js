import User from "../models/User.js";

const findByEmail = (email) => User.findOne({ email });

const findByVerificationToken = (token) =>
  User.findOne({ verificationToken: token });

const create = (userData) => User.create(userData);

const updateById = (id, userData) => User.findByIdAndUpdate(id, userData, { new: true });

export default { findByEmail, findByVerificationToken, create, updateById };
