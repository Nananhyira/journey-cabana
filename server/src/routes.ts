import { Router } from 'express';
import type { ParsedMap } from './mapParser';
import { isValidGuest, type Guest } from './guests';

/**
 * Two endpoints only, on purpose:
 * - GET /api/map is the single source of truth the frontend renders from.
 * - POST /api/book is the only mutation. No separate "get cabana" endpoint —
 *   the map response already contains full cabana state.
 */
export function createRouter(map: ParsedMap, guests: Guest[]): Router {
  const router = Router();

  router.get('/api/map', (_req, res) => {
    res.json(map);
  });

  router.post('/api/book', (req, res) => {
    const { cabanaId, room, guestName } = req.body ?? {};

    if (!cabanaId || !room || !guestName) {
      return res.status(400).json({ error: 'cabanaId, room, and guestName are required' });
    }

    const cabana = map.cabanas.find((c) => c.id === cabanaId);

    if (!cabana) {
      return res.status(404).json({ error: 'Cabana not found' });
    }

    if (cabana.status === 'booked') {
      return res.status(409).json({ error: 'This cabana is already booked' });
    }

    if (!isValidGuest(guests, room, guestName)) {
      return res.status(400).json({ error: "Room number and guest name don't match our records" });
    }

    cabana.status = 'booked';
    cabana.room = room;
    cabana.guestName = guestName;

    res.json(cabana);
  });

  return router;
}
