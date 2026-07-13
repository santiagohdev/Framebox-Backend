const fail = (res, message) => res.status(400).json({ message });

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return fail(res, "Nombre, email y contraseña son requeridos");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, "Email inválido");
  if (password.length < 6) return fail(res, "La contraseña debe tener al menos 6 caracteres");
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, "Email y contraseña son requeridos");
  next();
};

export const validateMovie = (req, res, next) => {
  const { title, year, rating } = req.body;
  if (req.method === "POST" && !title) return fail(res, "El título es requerido");
  if (year !== undefined && year !== "" && isNaN(Number(year))) return fail(res, "El año debe ser numérico");
  if (rating !== undefined && (isNaN(Number(rating)) || rating < 0 || rating > 5)) {
    return fail(res, "La puntuación debe ser un número entre 0 y 5");
  }
  next();
};

export const validateGenre = (req, res, next) => {
  const { name } = req.body;
  if (!name || !name.trim()) return fail(res, "El nombre del género es requerido");
  next();
};
