export interface Cabana {
  id: string;
  x: number;
  y: number;
  status: 'available' | 'booked';
  room?: string;
  guestName?: string;
}

export interface ResortMap {
  width: number;
  height: number;
  tiles: string[][];
  cabanas: Cabana[];
}

export interface BookingRequest {
  cabanaId: string;
  room: string;
  guestName: string;
}

export async function fetchMap(): Promise<ResortMap> {
  const res = await fetch('/api/map');
  if (!res.ok) {
    throw new Error('Could not load the resort map.');
  }
  return res.json();
}

export async function bookCabana(payload: BookingRequest): Promise<Cabana> {
  const res = await fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? 'Booking failed');
  }

  return data as Cabana;
}
