import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { levantarBase, limpiarBase, bajarBase } from './setup.js';

process.env.JWT_SECRET = 'clave-solo-para-tests';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

// El registro manda un mail de verificación. En los tests no queremos que
// salga nada a la red, así que se reemplaza por una función que no hace nada.
vi.mock('../src/utils/email.js', () => ({
  default: { sendVerificationEmail: vi.fn().mockResolvedValue(true) },
}));

let app;

beforeAll(async () => {
  await levantarBase();
  app = (await import('../src/app.js')).default;
});
afterAll(bajarBase);
beforeEach(limpiarBase);

/* El límite de intentos cuenta por IP. Como la app confía en el proxy
   (app.set("trust proxy", 1)), se puede darle a cada test una IP propia y
   así ninguno le gasta los intentos al siguiente. */
let nIp = 0;
const pedir = () => {
  nIp += 1;
  const ip = `10.0.0.${nIp}`;
  const con = (m) => (url) => request(app)[m](url).set('X-Forwarded-For', ip);
  return { post: con('post'), get: con('get') };
};

const nuevo = {
  name: 'Santiago',
  email: 'santi@ejemplo.com',
  password: 'unaClaveLarga123',
};

describe('POST /api/auth/register', () => {
  it('crea el usuario y devuelve 201', async () => {
    const cli = pedir();
    const res = await cli.post('/api/auth/register').send(nuevo);
    expect(res.status).toBe(201);
  });

  it('no permite dos cuentas con el mismo email', async () => {
    const cli = pedir();
    await cli.post('/api/auth/register').send(nuevo);
    const res = await cli.post('/api/auth/register').send(nuevo);
    expect(res.status).toBe(409);
  });

  it('rechaza el registro sin contraseña', async () => {
    const cli = pedir();
    const { password, ...sinClave } = nuevo;
    const res = await cli.post('/api/auth/register').send(sinClave);
    expect(res.status).toBe(400);
  });

  it('si el mail de verificación falla, no deja la cuenta a medio crear', async () => {
    const cli = pedir();
    const email = (await import('../src/utils/email.js')).default;
    email.sendVerificationEmail.mockRejectedValueOnce(new Error('SMTP caído'));

    const res = await cli.post('/api/auth/register').send(nuevo);
    expect(res.status).toBe(502);

    // Y el email tiene que quedar libre para volver a intentar.
    email.sendVerificationEmail.mockResolvedValueOnce(true);
    const segundo = await pedir().post('/api/auth/register').send(nuevo);
    expect(segundo.status).toBe(201);
  });

  it('nunca devuelve la contraseña, ni siquiera hasheada', async () => {
    const cli = pedir();
    const res = await cli.post('/api/auth/register').send(nuevo);
    expect(JSON.stringify(res.body)).not.toContain(nuevo.password);
    expect(JSON.stringify(res.body)).not.toContain('$2b$');
  });
});

describe('POST /api/auth/login', () => {
  it('no deja entrar a una cuenta sin verificar', async () => {
    const cli = pedir();
    await cli.post('/api/auth/register').send(nuevo);
    const res = await cli.post('/api/auth/login')
      .send({ email: nuevo.email, password: nuevo.password });
    expect(res.status).toBe(403);
  });

  it('rechaza la contraseña equivocada', async () => {
    const cli = pedir();
    await cli.post('/api/auth/register').send(nuevo);
    const res = await cli.post('/api/auth/login')
      .send({ email: nuevo.email, password: 'otraCosa' });
    expect([401, 403]).toContain(res.status);
  });

  it('rechaza un email que no existe', async () => {
    const cli = pedir();
    const res = await cli.post('/api/auth/login')
      .send({ email: 'nadie@ejemplo.com', password: 'loQueSea123' });
    expect([401, 404]).toContain(res.status);
  });
});

describe('rutas protegidas', () => {
  it('sin token responde 401', async () => {
    const cli = pedir();
    const res = await cli.get('/api/movies');
    expect(res.status).toBe(401);
  });

  it('con un token firmado con otra clave, 401', async () => {
    const cli = pedir();
    const falso = jwt.sign({ id: '123' }, 'clave-que-no-es');
    const res = await cli.get('/api/movies')
      .set('Authorization', `Bearer ${falso}`);
    expect(res.status).toBe(401);
  });

  it('con un token vencido, 401', async () => {
    const cli = pedir();
    const vencido = jwt.sign({ id: '123' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await cli.get('/api/movies')
      .set('Authorization', `Bearer ${vencido}`);
    expect(res.status).toBe(401);
  });
});

describe('sesión con cookie httpOnly', () => {
  async function registrarYVerificar(cli) {
    await cli.post('/api/auth/register').send(nuevo);
    const { default: userRepository } = await import('../src/repositories/userRepository.js');
    const u = await userRepository.findByEmail(nuevo.email);
    u.verified = true;
    await u.save();
  }

  it('el login manda el token en una cookie httpOnly y no en el cuerpo', async () => {
    const cli = pedir();
    await registrarYVerificar(cli);
    const res = await cli.post('/api/auth/login')
      .send({ email: nuevo.email, password: nuevo.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();

    const cookie = res.headers['set-cookie']?.find(c => c.startsWith('token='));
    expect(cookie).toBeDefined();
    expect(cookie).toContain('HttpOnly');
  });

  it('con esa cookie se entra a una ruta protegida', async () => {
    const cli = pedir();
    await registrarYVerificar(cli);
    const login = await cli.post('/api/auth/login')
      .send({ email: nuevo.email, password: nuevo.password });

    const res = await cli.get('/api/auth/me')
      .set('Cookie', login.headers['set-cookie']);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(nuevo.email);
  });

  it('logout borra la cookie', async () => {
    const cli = pedir();
    const res = await cli.post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie']?.find(c => c.startsWith('token='));
    expect(cookie).toMatch(/token=;|Expires=Thu, 01 Jan 1970/);
  });
});

describe('endurecimiento', () => {
  it('helmet pone las cabeceras de seguridad', async () => {
    const cli = pedir();
    const res = await cli.get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('el login corta después de muchos intentos seguidos', async () => {
    const cli = pedir();
    let ultimo;
    for (let i = 0; i < 14; i++) {
      ultimo = await cli.post('/api/auth/login')
        .send({ email: 'nadie@ejemplo.com', password: 'x'.repeat(10) });
    }
    expect(ultimo.status).toBe(429);
  });
});
