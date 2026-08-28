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

const nuevo = {
  name: 'Santiago',
  email: 'santi@ejemplo.com',
  password: 'unaClaveLarga123',
};

describe('POST /api/auth/register', () => {
  it('crea el usuario y devuelve 201', async () => {
    const res = await request(app).post('/api/auth/register').send(nuevo);
    expect(res.status).toBe(201);
  });

  it('no permite dos cuentas con el mismo email', async () => {
    await request(app).post('/api/auth/register').send(nuevo);
    const res = await request(app).post('/api/auth/register').send(nuevo);
    expect(res.status).toBe(409);
  });

  it('rechaza el registro sin contraseña', async () => {
    const { password, ...sinClave } = nuevo;
    const res = await request(app).post('/api/auth/register').send(sinClave);
    expect(res.status).toBe(400);
  });

  it('nunca devuelve la contraseña, ni siquiera hasheada', async () => {
    const res = await request(app).post('/api/auth/register').send(nuevo);
    expect(JSON.stringify(res.body)).not.toContain(nuevo.password);
    expect(JSON.stringify(res.body)).not.toContain('$2b$');
  });
});

describe('POST /api/auth/login', () => {
  it('no deja entrar a una cuenta sin verificar', async () => {
    await request(app).post('/api/auth/register').send(nuevo);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: nuevo.email, password: nuevo.password });
    expect(res.status).toBe(403);
  });

  it('rechaza la contraseña equivocada', async () => {
    await request(app).post('/api/auth/register').send(nuevo);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: nuevo.email, password: 'otraCosa' });
    expect([401, 403]).toContain(res.status);
  });

  it('rechaza un email que no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nadie@ejemplo.com', password: 'loQueSea123' });
    expect([401, 404]).toContain(res.status);
  });
});

describe('rutas protegidas', () => {
  it('sin token responde 401', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(401);
  });

  it('con un token firmado con otra clave, 401', async () => {
    const falso = jwt.sign({ id: '123' }, 'clave-que-no-es');
    const res = await request(app)
      .get('/api/movies')
      .set('Authorization', `Bearer ${falso}`);
    expect(res.status).toBe(401);
  });

  it('con un token vencido, 401', async () => {
    const vencido = jwt.sign({ id: '123' }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app)
      .get('/api/movies')
      .set('Authorization', `Bearer ${vencido}`);
    expect(res.status).toBe(401);
  });
});

describe('endurecimiento', () => {
  it('helmet pone las cabeceras de seguridad', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('el login corta después de muchos intentos seguidos', async () => {
    let ultimo;
    for (let i = 0; i < 14; i++) {
      ultimo = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nadie@ejemplo.com', password: 'x'.repeat(10) });
    }
    expect(ultimo.status).toBe(429);
  });
});
