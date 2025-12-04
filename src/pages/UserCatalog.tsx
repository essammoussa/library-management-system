import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, BookOpen, X } from "lucide-react";
import { BookCard } from "@/components/books/BookCard";
import { Book, UserBookState, BorrowedBook, ReservedBook } from "@/types/book";
import booksData from "@/data/books.json";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserCatalog() {
  // ------------------------------
  // State variables
  // ------------------------------
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Updated filter states
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [userBooks, setUserBooks] = useState<UserBookState>({
    borrowed: [],
    reserved: [],
  });

  const [processingBookId, setProcessingBookId] = useState<string | null>(null);

  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionType, setActionType] = useState<"borrow" | "reserve" | null>(null);
  const [notes, setNotes] = useState("");
  const [userName, setUserName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [returnDate, setReturnDate] = useState("");

  // ------------------------------
  // Load books and user data
  // ------------------------------
  useEffect(() => {
    loadBooks();
    loadUserBooks();
  }, []);

  const loadBooks = () => {
    setLoading(true);
    setTimeout(() => {
      setBooks(booksData as Book[]);
      setLoading(false);
    }, 800);
  };

  const loadUserBooks = () => {
    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");
    const reserved = JSON.parse(localStorage.getItem("reservedBooks") || "[]");
    setUserBooks({ borrowed, reserved });
  };

  // ------------------------------
  // Categories for filter dropdown
  // ------------------------------
  const categories = useMemo(() => {
    const unique = Array.from(new Set(books.map((b) => b.category)));
    return unique.sort();
  }, [books]);

  // ------------------------------
  //  Fully Updated Filtering Logic
  // ------------------------------
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || book.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" || book.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, searchQuery, categoryFilter, statusFilter]);

  // ------------------------------
  // Open modal
  // ------------------------------
  const openActionDialog = (book: Book, type: "borrow" | "reserve") => {
    setSelectedBook(book);
    setActionType(type);
    setNotes("");
    setUserName("");
    setQuantity(1);
    setReturnDate("");
    setIsDialogOpen(true);
  };

  // ------------------------------
  // Check borrowed/reserved
  // ------------------------------
  const isBookBorrowed = (bookId: string) =>
    userBooks.borrowed.some((b) => b.bookId === bookId);

  const isBookReserved = (bookId: string) =>
    userBooks.reserved.some((r) => r.bookId === bookId);

  // ------------------------------
  // Borrow handler
  // ------------------------------
  const handleBorrow = () => {
    if (!selectedBook) return;

    if (!userName) return alert("Enter your name");
    if (!returnDate) return alert("Select return date");
    if (quantity < 1 || quantity > selectedBook.availableQuantity)
      return alert(`Quantity must be 1-${selectedBook.availableQuantity}`);
    if (isBookBorrowed(selectedBook.id))
      return alert("Already borrowed!");

    setProcessingBookId(selectedBook.id);

    const borrowedBook: BorrowedBook = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(returnDate).toISOString(),
      quantity,
      notes,
      userName,
    };

    const updatedBorrowed = [...userBooks.borrowed, borrowedBook];
    localStorage.setItem("borrowedBooks", JSON.stringify(updatedBorrowed));
    setUserBooks((prev) => ({ ...prev, borrowed: updatedBorrowed }));

    setBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === selectedBook.id
          ? {
              ...b,
              availableQuantity: b.availableQuantity - quantity,
              available: b.availableQuantity - quantity > 0,
            }
          : b
      )
    );

    setProcessingBookId(null);
    setIsDialogOpen(false);
    alert("Book borrowed successfully!");
  };

  // ------------------------------
  // Reserve handler
  // ------------------------------
  const handleReserve = () => {
    if (!selectedBook) return;
    if (!userName) return alert("Enter your name");
    if (isBookReserved(selectedBook.id)) return alert("Already reserved!");

    const reservedBook: ReservedBook = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      reserverName: userName,
      reservationDate: new Date().toISOString(),
      notes,
      quantity,
    };

    const updatedReserved = [...userBooks.reserved, reservedBook];
    localStorage.setItem("reservedBooks", JSON.stringify(updatedReserved));
    setUserBooks((prev) => ({ ...prev, reserved: updatedReserved }));

    setIsDialogOpen(false);
    alert("Book reserved successfully!");
  };

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

      {/* NEW SEARCH & FILTER UI */}
      <div className="bg-card border rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading books...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredBooks.length === 0 && (
        <div className="bg-card border rounded-lg p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No books found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Books Grid */}
      {!loading && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={() => openActionDialog(book, "borrow")}
              onReserve={() => openActionDialog(book, "reserve")}
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
      <h2 className="text-xl font-bold">
        {actionType === "borrow" ? "Borrow" : "Reserve"} Book
      </h2>
      <p className="font-medium">{selectedBook.title}</p>

      {/* User Name */}
      <input
        type="text"
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full p-2 border rounded"
      />

      {/* Borrow Only Inputs */}
      {actionType === "borrow" && (
        <>
          <label className="block text-sm mt-2">Quantity</label>
          <input
            type="number"
            min={1}
            max={selectedBook.availableQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />

          <label className="block text-sm mt-2">Return Date</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </>
      )}

      {/* Notes */}
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full p-2 border rounded"
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-muted rounded"
          onClick={() => setIsDialogOpen(false)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-primary text-white rounded"
          onClick={actionType === "borrow" ? handleBorrow : handleReserve}
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
