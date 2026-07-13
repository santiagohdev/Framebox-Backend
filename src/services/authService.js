import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userRepository from "../repositories/userRepository.js";
import emailUtil from "../utils/email.js";

const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    const error = new Error("Faltan datos requeridos");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error("El email ya está registrado");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const newUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    verified: false,
    verificationToken,
  });

  await emailUtil.sendVerificationEmail(newUser.email, verificationToken);

  return newUser;
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Faltan datos requeridos");
    error.statusCode = 400;
    throw error;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Contraseña incorrecta");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

const verifyEmail = async (token) => {
  const user = await userRepository.findByVerificationToken(token);
  if (!user) {
    const error = new Error("Token de verificación inválido");
    error.statusCode = 400;
    throw error;
  }

  await userRepository.updateById(user._id, {
    verified: true,
    verificationToken: null,
  });
};

export default { register, login, verifyEmail };
