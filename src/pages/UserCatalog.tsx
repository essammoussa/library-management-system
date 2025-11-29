import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Loader2, BookOpen, X } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { Book, UserBookState, BorrowedBook, ReservedBook } from '@/types/book';
import booksData from '@/data/books.json';

export default function UserCatalog() {
  // ------------------------------
  // State variables
  // ------------------------------
  const [books, setBooks] = useState<Book[]>([]); // All books from the catalog
  const [loading, setLoading] = useState(true); // Loading state for books
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [selectedCategory, setSelectedCategory] = useState('all'); // Category filter
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // Availability filter
  const [userBooks, setUserBooks] = useState<UserBookState>({ borrowed: [], reserved: [] }); // User's borrowed/reserved books
  const [processingBookId, setProcessingBookId] = useState<string | null>(null); // ID of book being processed (borrow/reserve)

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null); // Book selected for action
  const [actionType, setActionType] = useState<'borrow' | 'reserve' | null>(null); // Current modal action
  const [notes, setNotes] = useState(''); // Notes input in modal
  const [userName, setUserName] = useState(''); // User name input
  const [quantity, setQuantity] = useState(1); // Quantity for borrowing
  const [returnDate, setReturnDate] = useState(''); // Return date input

  // ------------------------------
  // Load books and user data
  // ------------------------------
  useEffect(() => {
    loadBooks(); // Load catalog books
    loadUserBooks(); // Load borrowed/reserved books from localStorage
  }, []);

  const loadBooks = () => {
    setLoading(true);
    setTimeout(() => {
      setBooks(booksData as Book[]);
      setLoading(false);
    }, 800); // Simulate network delay
  };

  const loadUserBooks = () => {
    const borrowed = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    const reserved = JSON.parse(localStorage.getItem('reservedBooks') || '[]');
    setUserBooks({ borrowed, reserved });
  };

  // ------------------------------
  // Categories for filter dropdown
  // ------------------------------
  const categories = useMemo(() => {
    const unique = Array.from(new Set(books.map(b => b.category)));
    return ['all', ...unique.sort()];
  }, [books]);

  // ------------------------------
  // Filtered books based on search, category, availability
  // ------------------------------
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.status === 'available') ||
        (availabilityFilter === 'unavailable' && book.status !== 'available');

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [books, searchQuery, selectedCategory, availabilityFilter]);

  // ------------------------------
  // Open modal for borrow/reserve
  // ------------------------------
  const openActionDialog = (book: Book, type: 'borrow' | 'reserve') => {
    setSelectedBook(book);
    setActionType(type);
    setNotes('');
    setUserName('');
    setQuantity(1);
    setReturnDate('');
    setIsDialogOpen(true);
  };

  // ------------------------------
  // Check if user already borrowed/reserved a book
  // ------------------------------
  const isBookBorrowed = (bookId: string) => userBooks.borrowed.some(b => b.bookId === bookId);
  const isBookReserved = (bookId: string) => userBooks.reserved.some(r => r.bookId === bookId);

  // ------------------------------
  // Borrow book handler
  // ------------------------------
  const handleBorrow = () => {
    if (!selectedBook) return;

    // Validate inputs
    if (!userName) { alert('Enter your name'); return; }
    if (!returnDate) { alert('Select return date'); return; }
    if (quantity < 1 || quantity > selectedBook.availableQuantity) {
      alert(`Quantity must be 1-${selectedBook.availableQuantity}`);
      return;
    }
    if (isBookBorrowed(selectedBook.id)) {
      alert('Already borrowed!');
      return;
    }

    setProcessingBookId(selectedBook.id);

    // Create borrowed book object
    const borrowedBook: BorrowedBook = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(returnDate).toISOString(),
      quantity,
      notes,
      userName
    };

    // Update user's borrowed books
    const updatedBorrowed = [...userBooks.borrowed, borrowedBook];
    localStorage.setItem('borrowedBooks', JSON.stringify(updatedBorrowed));
    setUserBooks(prev => ({ ...prev, borrowed: updatedBorrowed }));

    // Update availability in catalog
    setBooks(prevBooks =>
      prevBooks.map(b =>
        b.id === selectedBook.id
          ? { ...b, availableQuantity: b.availableQuantity - quantity, available: b.availableQuantity - quantity > 0 }
          : b
      )
    );

    setProcessingBookId(null);
    setIsDialogOpen(false);
    alert('Book borrowed successfully!');
  };

  // ------------------------------
  // Reserve book handler
  // ------------------------------
  const handleReserve = () => {
    if (!selectedBook) return;
    if (!userName) { alert('Enter your name'); return; }
    if (isBookReserved(selectedBook.id)) { alert('Already reserved!'); return; }

    setProcessingBookId(selectedBook.id);

    const reservedBook: ReservedBook = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      reserverName: userName,
      reservationDate: new Date().toISOString(),
      notes,
      quantity
    };

    const updatedReserved = [...userBooks.reserved, reservedBook];
    localStorage.setItem('reservedBooks', JSON.stringify(updatedReserved));
    setUserBooks(prev => ({ ...prev, reserved: updatedReserved }));

    setProcessingBookId(null);
    setIsDialogOpen(false);
    alert('Book reserved successfully!');
  };

  // ------------------------------
  // Clear all filters
  // ------------------------------
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAvailabilityFilter('all');
  };

  const hasFilters = searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all';

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Book Catalog</h1>
        <p className="text-muted-foreground">Browse {books.length} books</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border rounded-lg p-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category & Availability Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Availability</label>
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="all">All Books</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="px-4 py-2 bg-destructive/10 text-destructive rounded flex items-center gap-2">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredBooks.length === 0 && (
        <div className="bg-card border rounded-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
          {hasFilters && <button onClick={clearFilters} className="px-6 py-2 bg-secondary rounded">Clear All Filters</button>}
        </div>
      )}

      {/* Books Grid */}
      {!loading && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={() => openActionDialog(book, 'borrow')}
              onReserve={() => openActionDialog(book, 'reserve')}
              isBorrowed={isBookBorrowed(book.id)}
              isReserved={isBookReserved(book.id)}
              isLoading={processingBookId === book.id}
            />
          ))}
        </div>
      )}

      {/* Modal for Borrow/Reserve */}
      {isDialogOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">{actionType === 'borrow' ? 'Borrow' : 'Reserve'} Book</h2>
            <p>{selectedBook.title}</p>

            {/* User Name Input */}
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="w-full p-2 border rounded"
            />

            {/* Borrow Inputs */}
            {actionType === 'borrow' && (
              <>
                <label className="block text-sm mt-2">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={selectedBook?.availableQuantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
                <label className="block text-sm mt-2">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={e => setReturnDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </>
            )}

            {/* Notes */}
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2 border rounded"
            />

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-muted rounded" onClick={() => setIsDialogOpen(false)}>Cancel</button>
              <button
                className="px-4 py-2 bg-primary text-white rounded"
                onClick={actionType === 'borrow' ? handleBorrow : handleReserve}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
