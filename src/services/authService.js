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

  /* Si el envío del mail falla, la cuenta YA está creada. Antes la excepción
     subía y el usuario recibía un 500: creía que el registro no había salido,
     pero no podía volver a intentarlo porque el email ya figuraba tomado, y
     tampoco podía entrar porque la cuenta estaba sin verificar. Quedaba
     encerrado. Ahora se borra la cuenta a medio crear y se avisa. */
  try {
    await emailUtil.sendVerificationEmail(newUser.email, verificationToken);
  } catch (fallo) {
    console.error("[registro] no se pudo enviar el mail de verificación:", fallo);
    await userRepository.deleteById(newUser._id);
    const error = new Error(
      "No pudimos enviarte el mail de verificación. Probá de nuevo en unos minutos."
    );
    error.statusCode = 502;
    throw error;
  }

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

  if (!user.verified) {
    const error = new Error(
      "Tenés que verificar tu email antes de iniciar sesión"
    );
    error.statusCode = 403;
    throw error;
  }

  /* Una hora dejaba al usuario afuera en medio de armar su colección, sin
     aviso y sin forma de renovar. Doce horas cubren una sesión real; lo
     correcto de verdad sería un refresh token en cookie httpOnly, pero eso
     cambia el contrato con el frontend y va aparte. */
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "12h" }
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
