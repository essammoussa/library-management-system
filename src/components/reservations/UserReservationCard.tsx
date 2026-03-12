import React from 'react';
import { ReservedBook } from '@/types/book';

// Props for the UserReservationCard component
interface Props {
  book: ReservedBook;              // The reserved book object
  imageUrl?: string;               // Optional image URL for the book
  onCancel?: (bookId: string) => void; // Optional callback to cancel the reservation
}

const UserReservationCard: React.FC<Props> = ({ book, imageUrl, onCancel }) => (
  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full">
    {/* Book image */}
    <div className="relative h-48 w-full overflow-hidden">
      <img
        src={imageUrl || "/placeholder.jpg"}
        alt={book.bookTitle}
        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute top-3 right-3">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/90 text-white backdrop-blur-md shadow-sm">
          Reserved
        </span>
      </div>
    </div>

    {/* Book details */}
    <div className="p-6 space-y-4 flex-1 flex flex-col">
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {book.bookTitle}
        </h3>
        <p className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-primary/5 text-primary uppercase tracking-tight">
          Since {new Date(book.reservationDate).toLocaleDateString()}
        </p>
      </div>

      {/* Optional notes about the reservation */}
      {book.notes && (
        <p className="text-xs text-muted-foreground/70 line-clamp-3 leading-relaxed flex-1 italic border-l-2 border-primary/10 pl-3">
          "{book.notes}"
        </p>
      )}

      {/* Cancel button, only shown if onCancel callback is provided */}
      {onCancel && (
        <button
          className="mt-4 w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-destructive text-destructive-foreground transition-all duration-300 font-bold text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] hover:bg-destructive/90"
          onClick={() => onCancel(book.bookId)}
        >
          Cancel Reservation
        </button>
      )}
    </div>
  </div>
);

export default UserReservationCard;
