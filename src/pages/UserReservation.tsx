import React, { useState, useEffect } from 'react';
import UserReservationCard from '@/components/reservations/UserReservationCard';
import { UserBookState } from '@/types/book';

export default function MyReservations() {
  // State to store user's borrowed and reserved books
  const [userBooks, setUserBooks] = useState<UserBookState>({ borrowed: [], reserved: [] });

  // Load reserved books from localStorage on component mount
  useEffect(() => {
    const reserved = JSON.parse(localStorage.getItem('reservedBooks') || '[]');
    setUserBooks(prev => ({ ...prev, reserved }));
  }, []);

  // Handler to cancel a reservation
  const handleCancel = (bookId: string) => {
    // Remove the canceled book from the reserved list
    const updatedReserved = userBooks.reserved.filter(b => b.bookId !== bookId);
    // Update localStorage
    localStorage.setItem('reservedBooks', JSON.stringify(updatedReserved));
    // Update state
    setUserBooks(prev => ({ ...prev, reserved: updatedReserved }));
    alert('Reservation canceled!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <h1 className="text-3xl font-bold">My Reservations</h1>

      {/* If no reserved books, show message */}
      {userBooks.reserved.length === 0 ? (
        <p>You have no reserved books.</p>
      ) : (
        // Display reserved books in a grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBooks.reserved.map(book => (
            <UserReservationCard
              key={book.bookId}
              book={book}
              onCancel={handleCancel} // Pass cancel handler to card
            />
          ))}
        </div>
      )}
    </div>
  );
}
