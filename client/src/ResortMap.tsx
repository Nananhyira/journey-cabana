import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { fetchMap, bookCabana, type ResortMap as ResortMapData, type Cabana } from './api';
import BookingModal from './BookingModal';
import './ResortMap.css';

const MAX_TILE_SIZE = 32;
const MIN_TILE_SIZE = 12;

export default function ResortMap() {
  const [map, setMap] = useState<ResortMapData | null>(null);
  const [selectedCabana, setSelectedCabana] = useState<Cabana | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tileSize, setTileSize] = useState(MAX_TILE_SIZE);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMap()
      .then(setMap)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Could not load the map.'));
  }, []);

  // Fit the grid to whatever width is actually available, instead of a
  // fixed breakpoint — a hardcoded size can't know the map's column count.
  useEffect(() => {
    if (!map) return;

    function recalcTileSize() {
      const available = wrapperRef.current?.clientWidth ?? MAX_TILE_SIZE * map!.width;
      const fitted = Math.floor(available / map!.width);
      setTileSize(Math.min(MAX_TILE_SIZE, Math.max(MIN_TILE_SIZE, fitted)));
    }

    recalcTileSize();
    window.addEventListener('resize', recalcTileSize);
    return () => window.removeEventListener('resize', recalcTileSize);
  }, [map]);

  function handleTileClick(x: number, y: number) {
    if (!map) return;
    const cabana = map.cabanas.find((c) => c.x === x && c.y === y);
    if (!cabana) return;

    if (cabana.status === 'booked') {
      setNotice(`That cabana is already booked (room ${cabana.room}).`);
      return;
    }

    setNotice(null);
    setSelectedCabana(cabana);
  }

  async function handleConfirmBooking(room: string, guestName: string) {
    if (!selectedCabana) return;

    const updated = await bookCabana({ cabanaId: selectedCabana.id, room, guestName });

    setMap((prev) =>
      prev ? { ...prev, cabanas: prev.cabanas.map((c) => (c.id === updated.id ? updated : c)) } : prev
    );
    setSelectedCabana(null);
    setNotice(`Booked! Room ${updated.room} is confirmed for ${updated.guestName}.`);
  }

  if (loadError) {
    return (
      <p role="alert" className="error">
        {loadError}
      </p>
    );
  }

  if (!map) {
    return <p>Loading resort map…</p>;
  }

  return (
    <div className="resort-map-wrapper" ref={wrapperRef}>
      {notice && <p className="notice">{notice}</p>}

      <div
        className="resort-map"
        style={{
          gridTemplateColumns: `repeat(${map.width}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${map.height}, ${tileSize}px)`,
          '--tile-size': `${tileSize}px`,
        } as CSSProperties}
      >
        {map.tiles.map((row, y) =>
          row.map((tile, x) => {
            const cabana = tile === 'W' ? map.cabanas.find((c) => c.x === x && c.y === y) : undefined;
            const classNames = ['tile', `tile-${tileClass(tile)}`];
            if (cabana?.status === 'booked') classNames.push('tile-booked');

            return (
              <div
                key={`${x}-${y}`}
                className={classNames.join(' ')}
                onClick={tile === 'W' ? () => handleTileClick(x, y) : undefined}
                onKeyDown={
                  tile === 'W'
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTileClick(x, y);
                        }
                      }
                    : undefined
                }
                role={tile === 'W' ? 'button' : undefined}
                tabIndex={tile === 'W' ? 0 : undefined}
                aria-label={tile === 'W' ? `Cabana, ${cabana?.status}` : undefined}
              />
            );
          })
        )}
      </div>

      {selectedCabana && (
        <BookingModal
          cabana={selectedCabana}
          onCancel={() => setSelectedCabana(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}

function tileClass(tile: string): string {
  switch (tile) {
    case 'W':
      return 'cabana';
    case 'p':
      return 'pool';
    case '#':
      return 'path';
    case 'c':
      return 'chalet';
    default:
      return 'empty';
  }
}
