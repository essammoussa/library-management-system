import React from 'react';
import { Book as BookIcon, User, Tag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Book } from '@/types/book';

interface BookCardProps {
  book: Book;
  onBorrow: (bookId: string) => void;
  onReserve: (bookId: string) => void;
  isBorrowed: boolean;
  isReserved: boolean;
  isLoading?: boolean;
}

export function BookCard({ 
  book, 
  onBorrow, 
  onReserve, 
  isBorrowed, 
  isReserved,
  isLoading = false 
}: BookCardProps) {
  
  const getButtonContent = () => {
    if (isBorrowed) {
      return {
        text: 'Already Borrowed',
        className: 'bg-muted text-muted-foreground cursor-not-allowed',
        icon: <CheckCircle className="w-4 h-4" />,
        disabled: true,
        onClick: () => {}
      };
    }

    if (isReserved) {
      return {
        text: 'Already Reserved',
        className: 'bg-muted text-muted-foreground cursor-not-allowed',
        icon: <Clock className="w-4 h-4" />,
        disabled: true,
        onClick: () => {}
      };
    }

    if (book.status === 'available') {
      return {
        text: 'Borrow Book',
        className: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        icon: <BookIcon className="w-4 h-4" />,
        disabled: isLoading,
        onClick: () => onBorrow(book.id)
      };
    }

    return {
      text: 'Reserve Book',
      className: 'bg-primary text-primary-foreground hover:bg-primary/90',
      icon: <Clock className="w-4 h-4" />,
      disabled: isLoading,
      onClick: () => onReserve(book.id)
    };
  };

  const button = getButtonContent();

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Book Cover */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 h-48 flex items-center justify-center group-hover:from-primary/20 group-hover:to-secondary/20 transition-colors">
        <BookIcon className="w-20 h-20 text-muted-foreground" />
      </div>

      {/* Book Info */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
        </div>

        {/* Author */}
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="w-4 h-4 mr-2" />
          <span className="line-clamp-1">{book.author}</span>
        </div>

        {/* Category */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Tag className="w-4 h-4 mr-2" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            {book.category}
          </span>
        </div>

        {/* Availability Status */}
        <div className="flex items-center text-sm">
          {book.status === 'available' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                Available ({book.availableQuantity})
              </span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2 text-red-500" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                Not Available
              </span>
            </>
          )}
        </div>

        {/* Description (if exists) */}
        {book.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t border-border">
            {book.description}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={button.onClick}
          disabled={button.disabled}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${button.className}`}
        >
          {button.icon}
          <span>{isLoading ? 'Processing...' : button.text}</span>
        </button>
      </div>
    </div>
  );
}