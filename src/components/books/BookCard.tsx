import React from 'react';
import { Book as BookIcon, User, Tag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Book } from '@/types/book';

interface BookCardProps {
  book: Book; // Book data
  onBorrow: (bookId: string) => void; // Callback to borrow the book
  onReserve: (bookId: string) => void; // Callback to reserve the book
  isBorrowed: boolean; // If the current user has borrowed this book
  isReserved: boolean; // If the current user has reserved this book
  isLoading?: boolean; // Optional loading state
}

export function BookCard({ 
  book, 
  onBorrow, 
  onReserve, 
  isBorrowed, 
  isReserved,
  isLoading = false // default false
}: BookCardProps) {
  
  // Determine button text, style, icon, and click behavior
  const getButtonContent = () => {
    if (isBorrowed) {
      return {
        text: 'Already Borrowed',
        className: 'bg-muted text-muted-foreground cursor-not-allowed',
        icon: <CheckCircle className="w-4 h-4" />,
        disabled: true,
        onClick: () => {} // disabled, no action
      };
    }

    if (isReserved) {
      return {
        text: 'Already Reserved',
        className: 'bg-muted text-muted-foreground cursor-not-allowed',
        icon: <Clock className="w-4 h-4" />,
        disabled: true,
        onClick: () => {} // disabled, no action
      };
    }

    if (book.status === 'available') {
      return {
        text: 'Borrow Book',
        className: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        icon: <BookIcon className="w-4 h-4" />,
        disabled: isLoading,
        onClick: () => onBorrow(book.id) // trigger borrow
      };
    }

    // Book is not available but can be reserved
    return {
      text: 'Reserve Book',
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
      icon: <Clock className="w-4 h-4" />,
      disabled: isLoading,
      onClick: () => onReserve(book.id) // trigger reserve
    };
  };

  const button = getButtonContent(); // current button config

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full min-h-[450px]">
      {/* Book Cover / Icon */}
      <div className="relative h-48 w-full overflow-hidden">
        {book.image ? (
          <img
            src={book.image}
            alt={book.title}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/20 h-full flex items-center justify-center">
            <BookIcon className="w-20 h-20 text-primary/40" />
          </div>
        )}
        {/* Quick Badge for availability */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
            book.status === 'available' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            {book.status === 'available' ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Book Info Section */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground/80 font-medium">
            <User className="w-3.5 h-3.5 mr-1.5 text-primary/60" />
            <span className="line-clamp-1">{book.author}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-primary/5 text-primary uppercase tracking-tight">
            <Tag className="w-3 h-3 mr-1.5" />
            {book.category}
          </span>
          {book.status === 'available' && (
            <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold bg-green-500/5 text-green-600 uppercase tracking-tight">
              {book.availableQuantity} Copies Left
            </span>
          )}
        </div>

        {/* Description (optional) - always takes available space to push button down */}
        <div className="flex-1">
          {book.description && (
            <p className="text-xs text-muted-foreground/70 line-clamp-3 leading-relaxed italic border-l-2 border-primary/10 pl-3">
              "{book.description}"
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={button.onClick}
          disabled={button.disabled}
          className={`w-full mt-auto flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${button.className}`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            button.icon
          )}
          <span>{isLoading ? 'Processing...' : button.text}</span>
        </button>
      </div>
    </div>
  );
}
