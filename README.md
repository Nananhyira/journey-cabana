# Resort Cabana Booking

An interactive resort map where guests can browse poolside cabanas and book an
available one in a single step (room number + guest name).

## Stack

- **Backend:** Node.js, Express, TypeScript — in-memory state, no database.
- **Frontend:** React, TypeScript, Vite.
- **Tests:** Vitest (both workspaces), Supertest for the API, React Testing
  Library for components.

## Project structure

```
journey-cabana/
├── run.sh
├── server/
│   ├── src/               # all TypeScript source + tests
│   └── data/              # map.ascii + bookings.json — kept separate from
│                           # src/ deliberately, see "Security notes" below
└── client/
    ├── src/
    └── public/assets/      # the resort tile images
```

## Running it

Requires Node.js 18+.

```bash
./run.sh
```

This installs dependencies for both `server/` and `client/` (skipped if
`node_modules` already exists), builds the client, and starts a single
Express process on `http://localhost:4000` that serves both the API and the
built frontend.

To point at different map/bookings files:

```bash
./run.sh --map ./path/to/map.ascii --bookings ./path/to/bookings.json
```

Both flags are optional and default to `server/data/map.ascii` and
`server/data/bookings.json`.

For active frontend development with hot reload, you can instead run the two
processes separately:

```bash
cd server && npm run dev      # http://localhost:4000
cd client && npm run dev      # http://localhost:5173, proxies /api to :4000
```

## Running the tests

```bash
cd server && npm install && npm test
cd client && npm install && npm test
```

`server` tests cover the map parser (grid parsing, cabana extraction,
malformed input) and the booking API (successful booking, unknown guest,
double-booking, missing fields, unknown cabana). `client` tests cover
rendering the map from the API, opening the booking modal on an available
cabana, and showing a notice instead of a modal for a booked one.

## How it works

- `GET /api/map` returns the parsed map (tile grid + cabana list with
  status) and is the frontend's only source of truth — it renders whatever
  it's given, with no client-side map logic of its own.
- `POST /api/book` is the only mutation. It validates the cabana exists and
  is available, checks the room/name pair against the guest registry, then
  marks the cabana booked and returns it. The frontend patches just that one
  cabana into local state, so the map updates immediately without a refetch.

## Design decisions and trade-offs

- **Each `W` tile is its own bookable cabana** (id `cabana-x-y`), rather than
  merging adjacent `W`s into one larger cabana. The brief describes clicking
  "a cabana," and per-tile booking is by far the simpler model — no cluster
  detection, no ambiguity about which tile within a group represents the
  booking.
- **`bookings.json` is treated as a guest registry, not a pre-existing
  reservation list.** Nothing in the file ties a guest to a specific cabana,
  so every cabana starts `available` and the file is only used to validate
  that a room+name pair belongs to an actual guest at booking time.
- **Only two endpoints.** No `GET /api/cabanas/:id`, no auth middleware, no
  persistence layer — the spec explicitly says no auth and no persistence are
  needed, so adding either would be unrewarded complexity.
- **In-memory state resets on restart**, by design — there's no requirement
  to persist bookings across runs.
- **The path-direction arrow assets (`arrowStraight`, `arrowCorner`, etc.)
  aren't used.** They're for wayfinding — deriving which variant belongs on
  a given `#` tile means inspecting how many neighboring path tiles it has
  (1 = dead end, 2 opposite = straight, 2 perpendicular = corner, 3+ =
  crossing) and rotating the right image. That's legitimate visual polish,
  not required by the booking flow, so it was left out as a scope decision
  rather than because the assets seemed unused.
- **Single Express process serves both API and built frontend** so `run.sh`
  can be one command instead of two coordinated processes in production,
  while `npm run dev` in `client/` still works standalone for iteration.
- **Accessibility/responsiveness were kept scoped, not exhaustive.** Cabana
  tiles are keyboard-operable (focusable, Enter/Space activates, same as a
  native button) and the booking modal moves focus in on open and closes on
  Escape. Tile size is computed from the actual available container width
  divided by the map's column count (clamped to a sensible min/max), so the
  grid fits any viewport rather than relying on fixed breakpoints. A full
  WCAG audit or multi-breakpoint layout felt out of scope for this task's
  size.

## Security notes

This app has no real secrets — no third-party API keys, no database
credentials, no auth signing keys — so there's nothing sensitive to protect
today. Even so, a few things are set up as if there were, since retrofitting
this later is worse than doing it up front:

- **`PORT` is read in one place** (`server/src/config.ts`), not scattered
  `process.env.X` calls. This app has no real secrets — no third-party API
  keys, no DB credentials — so there's no `.env` file or `dotenv` dependency;
  adding that machinery for a value with no sensitivity would be
  unnecessary complexity. If a real secret is ever needed, this is the one
  place config would expand to handle it.
- **`server/data/` is separate from `server/src/`.** Besides being cleaner,
  this closes off an entire class of bug: earlier in development,
  `bookings.ts` (code) and `bookings.json` (data) sat in the same folder
  with the same basename, and Node resolved an import to the wrong one at
  runtime. Separating code from data means that can't happen again, for any
  future file.
- **Basic HTTP hardening via `helmet`** (sensible default security headers)
  and a request body size cap (`express.json({ limit: '10kb' })`, since
  booking payloads are a few short fields and there's no reason to accept
  more).
- **No auth beyond room+name matching** — this is spec'd behavior, not an
  oversight (see the task README: "No auth—assume that knowing room number
  and guest name is sufficient auth"). In a real system this is where
  session-based guest auth would go.
