export interface Guest {
  room: string;
  guestName: string;
}

/**
 * Loads the guest registry (bookings.json). This file lists which room/name
 * pairs are valid guests of the resort — it's the "auth" source for booking,
 * not a pre-existing cabana reservation.
 */
export function loadGuests(raw: string): Guest[] {
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error('Bookings file must be a JSON array of { room, guestName }');
  }

  return data;
}

export function isValidGuest(guests: Guest[], room: string, guestName: string): boolean {
  const normalizedRoom = room.trim();
  const normalizedName = guestName.trim().toLowerCase();

  return guests.some(
    (guest) => guest.room === normalizedRoom && guest.guestName.trim().toLowerCase() === normalizedName
  );
}
