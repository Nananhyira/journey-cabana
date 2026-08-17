import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { parseMap } from './mapParser';
import { createRouter } from './routes';
import type { Guest } from './guests';

const guests: Guest[] = [{ room: '101', guestName: 'Alice Smith' }];

function buildApp() {
  const map = parseMap('.W.\n.p.');
  const app = express();
  app.use(express.json());
  app.use(createRouter(map, guests));
  return { app, map };
}

describe('GET /api/map', () => {
  it('returns the parsed map with cabana state', async () => {
    const { app, map } = buildApp();
    const res = await request(app).get('/api/map');

    expect(res.status).toBe(200);
    expect(res.body.cabanas).toHaveLength(map.cabanas.length);
    expect(res.body.cabanas[0].status).toBe('available');
  });
});

describe('POST /api/book', () => {
  it('books an available cabana for a valid guest', async () => {
    const { app, map } = buildApp();
    const cabanaId = map.cabanas[0].id;

    const res = await request(app)
      .post('/api/book')
      .send({ cabanaId, room: '101', guestName: 'Alice Smith' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('booked');
    expect(res.body.room).toBe('101');
  });

  it('rejects a guest that is not in the registry', async () => {
    const { app, map } = buildApp();
    const cabanaId = map.cabanas[0].id;

    const res = await request(app)
      .post('/api/book')
      .send({ cabanaId, room: '999', guestName: 'Nobody' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/records/);
  });

  it('rejects booking an already-booked cabana', async () => {
    const { app, map } = buildApp();
    const cabanaId = map.cabanas[0].id;

    await request(app).post('/api/book').send({ cabanaId, room: '101', guestName: 'Alice Smith' });
    const res = await request(app)
      .post('/api/book')
      .send({ cabanaId, room: '101', guestName: 'Alice Smith' });

    expect(res.status).toBe(409);
  });

  it('returns 404 for a cabana id that does not exist', async () => {
    const { app } = buildApp();

    const res = await request(app)
      .post('/api/book')
      .send({ cabanaId: 'cabana-99-99', room: '101', guestName: 'Alice Smith' });

    expect(res.status).toBe(404);
  });

  it('returns 400 when required fields are missing', async () => {
    const { app } = buildApp();
    const res = await request(app).post('/api/book').send({ room: '101' });
    expect(res.status).toBe(400);
  });
});
