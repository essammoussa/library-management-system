import React from 'react';

interface Props {
  book: {
    bookId: string;
    bookTitle: string;
    borrowDate: string;
    dueDate: string;
    quantity: number;
  };
  onReturn?: (bookId: string) => void;
}

export const UserBookCard: React.FC<Props> = ({ book, onReturn }) => {
  const today = new Date();
  const due = new Date(book.dueDate);
  const overdueDays = Math.max(Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)), 0);
  const fine = (overdueDays * 1).toFixed(2);

  return (
    <div className="border rounded-lg p-4 bg-card space-y-2">
      <h3 className="font-bold">{book.bookTitle}</h3>
      <p>Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</p>
      <p>Due: {new Date(book.dueDate).toLocaleDateString()}</p>
      <p>Quantity: {book.quantity}</p>
 

      
      {overdueDays > 0 && (
        <p className="text-red-600">
          Overdue: {overdueDays} days, Fine: ${fine}
        </p>
      )}

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
