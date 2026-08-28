import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import genreRoutes from "./routes/genreRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Detrás de Vercel la IP real viaja en X-Forwarded-For. Sin esto el límite
// por IP vería siempre la del proxy y contaría a todo el mundo junto.
app.set("trust proxy", 1);

// Cabeceras de seguridad por defecto: nosniff, frameguard, HSTS y compañía.
app.use(helmet());
/* credentials en true para que el navegador acepte la cookie de sesión.
   Con credenciales, el origen no puede ser "*": hay que nombrarlo. */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

/* Nada frenaba a alguien probando contraseñas contra /api/auth/login. Y como
   bcrypt es caro a propósito, cada intento cuesta CPU del servidor, así que
   además era una vía para saturarlo. */
export const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos. Probá de nuevo en 15 minutos." },
});

// Límite general, mucho más holgado: es un cinturón, no un filtro.
export const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.json({ message: "FrameBox API funcionando" });
});

app.use("/api", limiteGeneral);
app.use("/api/auth", limiteAuth, authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/search", searchRoutes);

app.use(errorHandler);

export default app;
