import React, { useState, useEffect } from 'react';
import UserReservationCard from '@/components/reservations/UserReservationCard';
import { UserBookState, Book } from '@/types/book';
import booksData from '@/data/books.json';
import { useToast } from '@/hooks/use-toast';
import { useRole } from "@/store/RoleContext";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function MyReservations() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();
  // State to store user's borrowed and reserved books
  const [userBooks, setUserBooks] = useState<UserBookState>({ borrowed: [], reserved: [] });
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Load reserved books from localStorage on component mount
  useEffect(() => {
    setAllBooks(booksData as Book[]);
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
    toast({ title: "Success", description: "Reservation canceled!" });
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 max-w-lg w-full">
          <Clock className="w-16 h-16 text-primary/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Unlock Reservations</h2>
          <p className="text-muted-foreground mb-8">Register now to reserve books and pick them up later.</p>
          <Button size="lg" className="w-full font-bold uppercase tracking-widest" onClick={() => navigate('/login?mode=register')}>
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Reservations</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your upcoming book requests</p>
      </div>

      {/* If no reserved books, show message */}
      {userBooks.reserved.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 text-center">
          <p className="text-muted-foreground font-medium">You don't have any pending reservations.</p>
        </div>
      ) : (
        // Display reserved books in a grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {userBooks.reserved.map(book => {
            const bookInfo = allBooks.find(b => b.id === book.bookId);
            return (
              <UserReservationCard
                key={book.bookId}
                book={book}
                imageUrl={bookInfo?.image}
                onCancel={handleCancel} // Pass cancel handler to card
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
