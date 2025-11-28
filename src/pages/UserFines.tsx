import React, { useEffect, useState } from 'react';
import { UserBookState } from '@/types/book';

export default function MyFines() {
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [totalFines, setTotalFines] = useState(0);

  useEffect(() => {
    const borrowed = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    setBorrowedBooks(borrowed);

    const fines = borrowed.reduce((acc, b) => {
      const today = new Date();
      const due = new Date(b.dueDate);
      const overdueDays = Math.max(Math.floor((today.getTime() - due.getTime()) / (1000*60*60*24)), 0);
      return acc + overdueDays * 0.5; 
    }, 0);
    setTotalFines(fines.toFixed(2)); 
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Fines</h1>
      {borrowedBooks.length === 0 ? (
        <p>No borrowed books.</p>
      ) : (
        <div className="space-y-4">
          {borrowedBooks.map(book => {
            const today = new Date();
            const due = new Date(book.dueDate);
            const overdueDays = Math.max(Math.floor((today.getTime() - due.getTime()) / (1000*60*60*24)), 0);
            const fine = (overdueDays * 0.5).toFixed(2);
            return overdueDays > 0 ? (
              <div key={book.bookId} className="border p-4 rounded bg-card">
                <p>{book.bookTitle} - Overdue {overdueDays} days - Fine ${fine}</p>
              </div>
            ) : null;
          })}
        </div>
      )}
      <p className="mt-4 font-bold">Total Fines: ${totalFines}</p>
    </div>
  );
}
