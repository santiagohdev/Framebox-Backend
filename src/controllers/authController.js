import authService from "../services/authService.js";

/* El token viaja en una cookie httpOnly, que JavaScript no puede leer. Antes
   iba en el cuerpo de la respuesta y el frontend lo guardaba en localStorage,
   de donde cualquier script que llegue a ejecutarse se lo lleva.

   Para que la cookie no sea "de terceros" —Safari las bloquea y Chrome las
   está eliminando—, el frontend sirve la API bajo su propio dominio con un
   rewrite de Vercel. Ver vercel.json en el repo del frontend. */
const opcionesCookie = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 12 * 60 * 60 * 1000, // igual que la expiración del token
  path: "/",
});

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      message: "Usuario creado correctamente",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const token = await authService.login(req.body);
    res.cookie("token", token, opcionesCookie());
    // El cuerpo ya no lleva el token: el navegador lo manda solo en cada pedido.
    res.status(200).json({ message: "Login exitoso" });
  } catch (error) {
    next(error);
  }
};

/* El frontend no puede leer la cookie, así que necesita preguntar quién es. */
const me = async (req, res) => {
  res.status(200).json({ user: { id: req.user.id, email: req.user.email } });
};

const logout = async (req, res) => {
  res.clearCookie("token", { ...opcionesCookie(), maxAge: undefined });
  res.status(200).json({ message: "Sesión cerrada" });
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res.status(200).json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    next(error);
  }
};

export default { register, login, logout, me, verifyEmail };
