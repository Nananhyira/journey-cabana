import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { Cabana } from './api';

interface Props {
  cabana: Cabana;
  onCancel: () => void;
  onConfirm: (room: string, guestName: string) => Promise<void>;
}

export default function BookingModal({ cabana, onCancel, onConfirm }: Props) {
  const [room, setRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onConfirm(room, guestName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onKeyDown={handleKeyDown}
    >
      <form className="modal" onSubmit={handleSubmit}>
        <h2 id="booking-modal-title">Book cabana</h2>

        <label>
          Room number
          <input ref={firstInputRef} value={room} onChange={(e) => setRoom(e.target.value)} required />
        </label>

        <label>
          Guest name
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Booking…' : 'Confirm booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
