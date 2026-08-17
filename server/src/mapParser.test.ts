import { describe, it, expect } from 'vitest';
import { parseMap } from './mapParser';

const sample = ['.WW.', '.pp.'].join('\n');

describe('parseMap', () => {
  it('parses tiles into a grid matching the input dimensions', () => {
    const result = parseMap(sample);
    expect(result.height).toBe(2);
    expect(result.width).toBe(4);
    expect(result.tiles[0]).toEqual(['.', 'W', 'W', '.']);
    expect(result.tiles[1]).toEqual(['.', 'p', 'p', '.']);
  });

  it('creates one cabana per W tile, all available by default', () => {
    const result = parseMap(sample);
    expect(result.cabanas).toHaveLength(2);
    expect(result.cabanas.every((c) => c.status === 'available')).toBe(true);
    expect(result.cabanas.map((c) => c.id)).toEqual(['cabana-1-0', 'cabana-2-0']);
  });

  it('pads short lines with empty tiles instead of failing', () => {
    const result = parseMap('.WW.\n.p');
    expect(result.tiles[1]).toEqual(['.', 'p', '.', '.']);
  });

  it('throws on an unrecognised symbol', () => {
    expect(() => parseMap('.X.')).toThrow(/Unknown map symbol/);
  });

  it('throws on an empty file', () => {
    expect(() => parseMap('')).toThrow(/empty/);
  });
});
