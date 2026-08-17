const VALID_TILES = ['W', 'p', '#', 'c', '.'] as const;
export type TileChar = (typeof VALID_TILES)[number];

export interface Cabana {
  id: string;
  x: number;
  y: number;
  status: 'available' | 'booked';
  room?: string;
  guestName?: string;
}

export interface ParsedMap {
  width: number;
  height: number;
  tiles: TileChar[][];
  cabanas: Cabana[];
}

/**
 * Parses the ASCII resort map into a tile grid plus a flat list of cabanas.
 *
 * Assumption: each individual "W" cell is its own bookable cabana (rather than
 * merging adjacent W's into one large cabana). This keeps booking logic simple
 * and matches "click a cabana" as a per-tile interaction.
 */
export function parseMap(raw: string): ParsedMap {
  const lines = raw.replace(/\r\n/g, '\n').split('\n').filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error('Map file is empty');
  }

  const height = lines.length;
  const width = Math.max(...lines.map((line) => line.length));
  const tiles: TileChar[][] = [];
  const cabanas: Cabana[] = [];

  for (let y = 0; y < height; y++) {
    const line = lines[y];
    const row: TileChar[] = [];

    for (let x = 0; x < width; x++) {
      const ch = line[x] ?? '.';

      if (!VALID_TILES.includes(ch as TileChar)) {
        throw new Error(`Unknown map symbol "${ch}" at (${x}, ${y})`);
      }

      const tile = ch as TileChar;
      row.push(tile);

      if (tile === 'W') {
        cabanas.push({ id: `cabana-${x}-${y}`, x, y, status: 'available' });
      }
    }

    tiles.push(row);
  }

  return { width, height, tiles, cabanas };
}
