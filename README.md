# FrameBox — API

Backend de FrameBox, la biblioteca personal de películas. Express sobre
MongoDB, con autenticación por JWT y verificación de e-mail.

**En vivo:** https://framebox-backend.vercel.app
**Frontend:** https://github.com/santiagohdev/Framebox-Frontend

## Arquitectura

Cuatro capas, cada una con una sola responsabilidad:

```
routes → controllers → services → repositories → modelos
```

- **routes** — qué URL responde a qué, y qué validación corre antes
- **controllers** — traducen HTTP a llamadas de servicio y de vuelta
- **services** — la lógica del negocio; no saben que existe HTTP
- **repositories** — lo único que habla con Mongoose

## Endpoints

| Método | Ruta | Protegido |
|---|---|---|
| POST | `/api/auth/register` | no |
| POST | `/api/auth/login` | no |
| GET | `/api/auth/verify/:token` | no |
| GET/POST/PUT/DELETE | `/api/movies` | sí |
| GET | `/api/genres` | sí |
| GET | `/api/search` | sí |

## Seguridad

- Contraseñas con **bcrypt**, 10 rondas
- **JWT** firmado con `JWT_SECRET`, sin valor por defecto: si falta, la app
  no arranca en vez de firmar con algo adivinable
- **CORS** restringido a `FRONTEND_URL`
- **helmet** para las cabeceras
- **Límite de intentos**: 10 cada 15 minutos en `/api/auth`, 300 en el resto
- Los errores 500 devuelven un mensaje genérico; el detalle va al log del
  servidor, no al cliente

## Levantarlo

```bash
npm install
cp .env.example .env    # y completar los valores
npm run dev
```

## Tests

```bash
npm test
```

Levantan un MongoDB en memoria, así que no hace falta tener Mongo instalado
ni tocar la base real. Cubren registro, login, tokens inválidos y vencidos,
que la contraseña nunca salga en una respuesta, y que helmet y el límite de
intentos estén efectivamente activos.
