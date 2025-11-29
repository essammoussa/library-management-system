import React from 'react';

// Props for the UserBookCard component
interface Props {
  book: {
    bookId: string;       // Unique ID of the book
    bookTitle: string;    // Title of the book
    borrowDate: string;   // Date the book was borrowed
    dueDate: string;      // Date the book is due
    quantity: number;     // Number of copies borrowed
  };
  onReturn?: (bookId: string) => void; // Optional callback for returning the book
}

export const UserBookCard: React.FC<Props> = ({ book, onReturn }) => {
  // Calculate overdue information
  const today = new Date();
  const due = new Date(book.dueDate);

  // Difference in days between today and due date; minimum 0
  const overdueDays = Math.max(
    Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  // Fine calculation: $1 per overdue day
  const fine = (overdueDays * 1).toFixed(2);

  return (
    <div className="border rounded-lg p-4 bg-card space-y-2">
      {/* Book Title */}
      <h3 className="font-bold">{book.bookTitle}</h3>

      {/* Borrow and Due Dates */}
      <p>Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</p>
      <p>Due: {new Date(book.dueDate).toLocaleDateString()}</p>

      {/* Quantity borrowed */}
      <p>Quantity: {book.quantity}</p>

      {/* Overdue info */}
      {overdueDays > 0 && (
        <p className="text-red-600">
          Overdue: {overdueDays} days, Fine: ${fine}
        </p>
      )}

      {/* Return button, shown only if onReturn callback is provided */}
      {onReturn && (
        <button
          className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          onClick={() => onReturn(book.bookId)}
        >
          Return
        </button>
      )}
    </div>
  );
};

export default UserBookCard;
