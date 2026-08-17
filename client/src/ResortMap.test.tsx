import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResortMap from './ResortMap';

const mockMap = {
  width: 2,
  height: 1,
  tiles: [['W', 'W']],
  cabanas: [
    { id: 'cabana-0-0', x: 0, y: 0, status: 'available' },
    { id: 'cabana-1-0', x: 1, y: 0, status: 'booked', room: '101', guestName: 'Alice Smith' },
  ],
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMap,
    })
  );
});

describe('ResortMap', () => {
  it('renders one clickable tile per cabana after loading', async () => {
    render(<ResortMap />);
    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(2));
  });

  it('opens the booking modal when an available cabana is clicked', async () => {
    render(<ResortMap />);
    const buttons = await screen.findAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('shows a notice instead of a modal for an already-booked cabana', async () => {
    render(<ResortMap />);
    const buttons = await screen.findAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(await screen.findByText(/already booked/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
