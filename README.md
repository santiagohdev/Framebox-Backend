# FrameBox — Backend

API REST para FrameBox, biblioteca personal de películas. Node.js + Express + MongoDB (Mongoose), autenticación JWT y verificación de email.

## Tecnologías
Express · Mongoose · bcrypt · jsonwebtoken · Nodemailer · dotenv · cors

## Arquitectura
```
src/
 ├─ config/       # conexión a MongoDB
 ├─ models/       # User, Movie, Genre
 ├─ repositories/ # único acceso a Mongoose
 ├─ services/     # lógica de negocio
 ├─ controllers/  # req/res/next
 ├─ routes/       # endpoints
 ├─ middleware/   # auth, validación, errores
 └─ utils/        # envío de emails
```
Flujo: `routes → controllers → services → repositories → models`

## Instalación
```bash
npm install
cp .env.example .env   # completar valores reales
npm run dev            # nodemon
npm start               # producción
```

## Clonar repositorio

```bash

git clone https://github.com/santiagohdev/Framebox-Backend.git

cd framebox-backend


## Variables de entorno
| Variable | Descripción |
|---|---|
| PORT | Puerto del servidor |
| MONGO_URI | Conexión a MongoDB |
| JWT_SECRET | Secreto para firmar JWT |
| EMAIL_USER / EMAIL_PASS | Cuenta Gmail (usar contraseña de aplicación) |
| API_URL | URL pública del backend (para el link del email) |
| FRONTEND_URL | URL del frontend (para CORS) |

## Endpoints

### Auth
| Método | Ruta | Body | Protegida |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | No |
| POST | `/api/auth/login` | `{ email, password }` | No |
| GET | `/api/auth/verify/:token` | — | No |

Ejemplo login → `200 { message, token }`

### Movies (todas requieren `Authorization: Bearer <token>`)
| Método | Ruta | Body |
|---|---|---|
| GET | `/api/movies` | — |
| GET | `/api/movies/:id` | — |
| POST | `/api/movies` | `{ title, year, description, poster, genre, status, rating }` |
| PUT | `/api/movies/:id` | campos a actualizar |
| PUT | `/api/movies/:id/favorite` | — (alterna favorito) |
| DELETE | `/api/movies/:id` | — |

### Genres
| Método | Ruta | Protegida |
|---|---|---|
| GET | `/api/genres` | No |
| GET | `/api/genres/:id` | No |
| POST | `/api/genres` `{ name }` | Sí |
| PUT | `/api/genres/:id` `{ name }` | Sí |
| DELETE | `/api/genres/:id` | Sí |
