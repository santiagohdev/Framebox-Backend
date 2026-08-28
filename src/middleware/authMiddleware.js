import jwt from "jsonwebtoken";

/* La sesión viaja en una cookie httpOnly. Se sigue aceptando el encabezado
   Authorization porque es lo que usan los clientes que no son el navegador
   —curl, Postman, los tests— y porque permite migrar sin romper nada. */
const authMiddleware = (req, res, next) => {
  const desdeCookie = req.cookies?.token;
  const encabezado = req.headers.authorization;
  const desdeEncabezado = encabezado?.startsWith("Bearer ")
    ? encabezado.slice(7)
    : null;

  const token = desdeCookie || desdeEncabezado;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export default authMiddleware;
