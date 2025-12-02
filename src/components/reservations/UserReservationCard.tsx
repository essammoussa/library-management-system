import React from 'react';
import { ReservedBook } from '@/types/book';

// Props for the UserReservationCard component
interface Props {
  book: ReservedBook;              // The reserved book object
  onCancel?: (bookId: string) => void; // Optional callback to cancel the reservation
}

const UserReservationCard: React.FC<Props> = ({ book, onCancel }) => (
  <div className="border rounded-lg p-4 bg-card space-y-2">
    {/* Book Title */}
    <h3 className="font-bold">{book.bookTitle}</h3>

    {/* Reservation Date */}
    <p>Date: {new Date(book.reservationDate).toLocaleDateString()}</p>

    {/* Optional notes about the reservation */}
    {book.notes && <p>Notes: {book.notes}</p>}

    {/* Cancel button, only shown if onCancel callback is provided */}
    {onCancel && (
      <button
        className="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
        onClick={() => onCancel(book.bookId)}
      >
        Cancel
      </button>
    )}
  </div>
);

export default UserReservationCard;
