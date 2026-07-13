import authService from "../services/authService.js";

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
    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.params.token);
    res.status(200).json({ message: "Cuenta verificada correctamente" });
  } catch (error) {
    next(error);
  }
};

export default { register, login, verifyEmail };
