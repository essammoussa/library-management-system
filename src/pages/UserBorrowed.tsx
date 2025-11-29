import React, { useState, useEffect } from 'react';
import UserBookCard from '@/components/UserBookCard';
import { UserBookState } from '@/types/book';

export default function MyBooks() {
  const [userBooks, setUserBooks] = useState<UserBookState>({ borrowed: [], reserved: [] }); 

  useEffect(() => {
  const borrowed = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
  const reserved = JSON.parse(localStorage.getItem('reservedBooks') || '[]');

  const DAILY_RATE = 1; // $1 per day
  const updatedBorrowed = borrowed.map((b: any) => {
    const today = new Date();
    const due = new Date(b.dueDate);
    const overdueDays = Math.max(
      Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
      0
    );

    return { 
      ...b, 
      overdueDays, 
      fineAmount: overdueDays * DAILY_RATE 
    };
  });

  setUserBooks({ borrowed: updatedBorrowed, reserved });
}, []);



  const handleReturn = (bookId: string) => {
    const updatedBorrowed = userBooks.borrowed.filter(b => b.bookId !== bookId);
    localStorage.setItem('borrowedBooks', JSON.stringify(updatedBorrowed));
    setUserBooks(prev => ({ ...prev, borrowed: updatedBorrowed }));
    alert('Book returned successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Books</h1>
      {userBooks.borrowed.length === 0 ? (
        <p>You have no borrowed books.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBooks.borrowed.map(book => (
            <UserBookCard key={book.bookId} book={book} onReturn={handleReturn} />
          ))}
        </div>
      )}
    </div>
  );
}
