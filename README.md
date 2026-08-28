# FrameBox — API

Backend de FrameBox, la biblioteca personal de películas. Express sobre
MongoDB, con autenticación por JWT y verificación de e-mail.

**En vivo:** https://framebox-backend.vercel.app
**Frontend:** https://github.com/santiagohdev/Framebox-Frontend

## Qué hace

- Registro con verificación por e-mail (Nodemailer), login y logout
- CRUD de películas y géneros, siempre acotado al usuario dueño
- Búsqueda y filtrado
- Sesión por cookie `httpOnly`

| Método | Ruta | Protegido |
|---|---|---|
| POST | `/api/auth/register` | no |
| POST | `/api/auth/login` | no |
| POST | `/api/auth/logout` | no |
| GET | `/api/auth/me` | sí |
| GET | `/api/auth/verify/:token` | no |
| GET/POST/PUT/DELETE | `/api/movies` | sí |
| GET | `/api/genres` | sí |
| GET | `/api/search` | sí |

## Stack

Express · MongoDB con Mongoose · JWT · bcrypt · Nodemailer · Vitest

## Decisiones

**Cuatro capas, no tres.** `routes → controllers → services → repositories`.
La que suele faltar es la última: sin ella, la lógica de negocio termina
sabiendo de Mongoose, y cambiar de base o testear obliga a levantar una. Acá
los servicios no saben cómo se guardan las cosas, y por eso los tests corren
contra un Mongo en memoria sin tocar una línea del código de producción.

**El token va en cookie `httpOnly`, no en el cuerpo de la respuesta.** Si lo
devuelve la API, el frontend tiene que guardarlo en algún lado, y ese lado
siempre termina siendo `localStorage`, que cualquier script inyectado lee. En
una cookie `httpOnly` el navegador la manda sola y el JavaScript no la ve.

El middleware igual acepta el encabezado `Authorization`: es lo que usan curl,
Postman y los tests, y permitió migrar sin romper el frontend de un día para
el otro.

**Los errores 500 no dicen qué pasó.** Un 400 sí: ese mensaje lo escribimos
nosotros y le sirve a quien llama. Pero `err.message` en un 500 puede ser un
error de Mongo con nombres de colecciones y detalles del esquema. Ahora los
5xx responden un mensaje genérico y el detalle va al log del servidor. Fuera
de producción se sigue viendo, para poder depurar.

**El límite de intentos es agresivo sólo en `/api/auth`.** Diez cada quince
minutos ahí, trescientos en el resto. La razón no es sólo el fuerza bruta:
bcrypt es caro a propósito, así que cada intento de login gasta CPU del
servidor. Sin límite, el login era también la forma más barata de saturarlo.

**`JWT_SECRET` no tiene valor por defecto.** Si falta, la app no arranca. Un
`|| "secret"` habría hecho que funcione en desarrollo y que en producción
firmara tokens con una clave que está en GitHub.

**Si falla el mail de verificación, se borra la cuenta.** Antes la cuenta
quedaba creada y el usuario recibía un 500: creía que el registro no había
salido, no podía reintentar porque el email figuraba tomado, y no podía entrar
porque estaba sin verificar. Quedaba encerrado sin salida.

## Levantarlo

```bash
npm install
cp .env.example .env    # y completar los valores
npm run dev
```

## Cuenta de demostración

```bash
MONGO_URI="..." npm run seed:demo
```

Crea `utnframebox@gmail.com` / `usuarioframebox` ya verificada, con géneros y
ocho películas en distintos estados. Es idempotente: volver a correrlo repone
la contraseña y las películas en vez de duplicar, así que también sirve para
devolver la demo a su estado original cuando alguien la deja desordenada.

## Tests

```bash
npm test
```

Dieciséis tests sobre un MongoDB en memoria, así que no hace falta tener Mongo
instalado ni tocar la base real. Cubren registro, login, tokens firmados con
otra clave, tokens vencidos, que la contraseña nunca aparezca en una respuesta,
el flujo completo de la cookie, y que helmet y el límite de intentos estén
efectivamente activos.

Cada test usa una IP distinta vía `X-Forwarded-For`: el límite cuenta por IP y
compartirla hacía que un test le gastara los intentos al siguiente.
