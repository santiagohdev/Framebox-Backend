/* Antes esto devolvía err.message siempre. Para un 400 está bien: el mensaje
   lo escribimos nosotros y le sirve al cliente. Para un 500 no, porque ahí
   err.message puede ser un error de Mongo con nombres de colecciones o
   detalles del esquema, y eso es información que no hay por qué regalar a
   quien esté sondeando la API. */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const esFallaNuestra = statusCode >= 500;

  if (esFallaNuestra) {
    console.error("[error]", req.method, req.originalUrl, err);
  }

  res.status(statusCode).json({
    message: esFallaNuestra
      ? "Error interno del servidor"
      : err.message || "Error en la petición",
    // El detalle real sólo fuera de producción, para poder depurar.
    ...(esFallaNuestra && process.env.NODE_ENV !== "production"
      ? { detalle: err.message }
      : {}),
  });
};

export default errorHandler;
