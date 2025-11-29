import React, { useState, useEffect } from 'react';
import UserBookCard from '@/components/UserBookCard';
import { UserBookState } from '@/types/book';

export default function MyBooks() {
  // State to store user's borrowed and reserved books
  const [userBooks, setUserBooks] = useState<UserBookState>({
    borrowed: [],
    reserved: []
  });

  // Load borrowed and reserved books from localStorage on component mount
  useEffect(() => {
    const borrowed = JSON.parse(localStorage.getItem('borrowedBooks') || '[]'); // Get borrowed books
    const reserved = JSON.parse(localStorage.getItem('reservedBooks') || '[]'); // Get reserved books

    const DAILY_RATE = 1; // $1 per day fine for overdue books

    // Calculate overdue days and fine for each borrowed book
    const updatedBorrowed = borrowed.map((b: any) => {
      const today = new Date();
      const due = new Date(b.dueDate);

      // Calculate number of overdue days
      const overdueDays = Math.max(
        Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
        0 // Ensure no negative days
      );

      return {
        ...b,
        overdueDays,
        fineAmount: overdueDays * DAILY_RATE // Calculate fine
      };
    });

    // Update state with borrowed and reserved books
    setUserBooks({ borrowed: updatedBorrowed, reserved });
  }, []);

  // Function to handle returning a book
  const handleReturn = (bookId: string) => {
    // Remove the returned book from borrowed list
    const updatedBorrowed = userBooks.borrowed.filter(b => b.bookId !== bookId);

    // Update localStorage
    localStorage.setItem('borrowedBooks', JSON.stringify(updatedBorrowed));

    // Update state
    setUserBooks(prev => ({ ...prev, borrowed: updatedBorrowed }));

    // Notify user
    alert('Book returned successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Books</h1>

      {/* If no borrowed books, show a message */}
      {userBooks.borrowed.length === 0 ? (
        <p>You have no borrowed books.</p>
      ) : (
        // Display borrowed books in a responsive grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBooks.borrowed.map(book => (
            // Each book rendered using UserBookCard component
            <UserBookCard key={book.bookId} book={book} onReturn={handleReturn} />
          ))}
        </div>
      )}
    </div>
  );
}
