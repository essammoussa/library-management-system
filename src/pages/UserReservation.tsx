import React, { useState, useEffect } from 'react';
import UserReservationCard from '@/components/UserReservationCard';
import { UserBookState } from '@/types/book';

export default function MyReservations() {
  const [userBooks, setUserBooks] = useState<UserBookState>({ borrowed: [], reserved: [] });

  useEffect(() => {
    const reserved = JSON.parse(localStorage.getItem('reservedBooks') || '[]');
    setUserBooks(prev => ({ ...prev, reserved }));
  }, []);

  const handleCancel = (bookId: string) => {
    const updatedReserved = userBooks.reserved.filter(b => b.bookId !== bookId);
    localStorage.setItem('reservedBooks', JSON.stringify(updatedReserved));
    setUserBooks(prev => ({ ...prev, reserved: updatedReserved }));
    alert('Reservation canceled!');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Reservations</h1>
      {userBooks.reserved.length === 0 ? (
        <p>You have no reserved books.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBooks.reserved.map(book => (
            <UserReservationCard key={book.bookId} book={book} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
