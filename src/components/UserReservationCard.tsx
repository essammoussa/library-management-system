import React from 'react';
import { ReservedBook } from '@/types/book';

interface Props {
  book: ReservedBook;
  onCancel?: (bookId: string) => void;
}

const UserReservationCard: React.FC<Props> = ({ book, onCancel }) => (
  <div className="border rounded-lg p-4 bg-card space-y-2">
    <h3 className="font-bold">{book.bookTitle}</h3>
    <p>Date: {new Date(book.reservationDate).toLocaleDateString()}</p>
    {book.notes && <p>Notes: {book.notes}</p>}
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
