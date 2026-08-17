import express from 'express';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import { parseMap } from './mapParser';
import { loadGuests } from './guests';
import { createRouter } from './routes';

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      args[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }

  return args;
}

const args = parseArgs(process.argv.slice(2));

// Defaults are resolved against this file's location, not the process's
// working directory — so `npm run dev` from anywhere still finds the
// bundled sample data without requiring --map/--bookings.
const mapPath = args.map ? path.resolve(args.map) : path.resolve(__dirname, '../data/map.ascii');
const bookingsPath = args.bookings
  ? path.resolve(args.bookings)
  : path.resolve(__dirname, '../data/bookings.json');

const map = parseMap(fs.readFileSync(mapPath, 'utf-8'));
const guests = loadGuests(fs.readFileSync(bookingsPath, 'utf-8'));

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10kb' })); // booking payloads are tiny; caps abuse of the endpoint
app.use(createRouter(map, guests));

// Serve the built frontend so a single process + single command covers both.
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(config.port, () => {
  console.log(`Resort API running on http://localhost:${config.port}`);
  console.log(`Map: ${mapPath}`);
  console.log(`Bookings: ${bookingsPath}`);
});
