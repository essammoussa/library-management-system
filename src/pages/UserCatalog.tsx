// ================================
// IMPORTS
// ================================
import React, { useState, useEffect, useMemo } from "react";
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

// ================================
// MAIN COMPONENT
// ================================
export default function UserCatalog() {
  // ================================
  // STATE VARIABLES
  // ================================
  const [books, setBooks] = useState<Book[]>([]); // All books from JSON
  const [loading, setLoading] = useState(true); // Loading state for books

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // User's borrowed and reserved books
  const [userBooks, setUserBooks] = useState<UserBookState>({
    borrowed: [],
    reserved: [],
  });

  const [processingBookId, setProcessingBookId] = useState<string | null>(null); // Track which book is being borrowed/reserved

  // ================================
  // MODAL STATES
  // ================================
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Show/hide modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null); // Book selected in modal
  const [actionType, setActionType] = useState<"borrow" | "reserve" | null>(null); // Borrow or Reserve

  // Modal inputs
  const [notes, setNotes] = useState(""); // Notes entered by user
  const [userName, setUserName] = useState(""); // User name input
  const [phoneNumber, setPhoneNumber] = useState(""); // Phone number input
  const [returnDate, setReturnDate] = useState(""); // Return date input (borrow only)

  // ================================
  // LOAD BOOKS + LOCAL STORAGE
  // ================================
  useEffect(() => {
    // Load books after a small delay (simulate loading)
    setTimeout(() => {
      setBooks(booksData as Book[]);
      setLoading(false);
    }, 300);

    // Load user's borrowed and reserved books from localStorage
    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");
    const reserved = JSON.parse(localStorage.getItem("reservedBooks") || "[]");

    setUserBooks({ borrowed, reserved });
  }, []);

  // ================================
  // EXTRACT UNIQUE CATEGORIES
  // ================================
  const categories = useMemo(() => {
    // Get unique categories from books
    return Array.from(new Set(books.map((b) => b.category))).sort();
  }, [books]);

  // ================================
  // FILTERING LOGIC
  // ================================
  const filteredBooks = useMemo(() => {
    // Filter books by search, category, and status
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || book.category === categoryFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && book.availableQuantity > 0) ||
        (statusFilter === "borrowed" && book.availableQuantity === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [books, searchQuery, categoryFilter, statusFilter]);

  // ================================
  // CHECKERS
  // ================================
  // Check if a book is already borrowed
  const isBookBorrowed = (bookId: string) =>
    userBooks.borrowed.some((b) => b.bookId === bookId);

  // Check if a book is already reserved
  const isBookReserved = (bookId: string) =>
    userBooks.reserved.some((r) => r.bookId === bookId);

  // ================================
  // OPEN MODAL
  // ================================
  const openActionDialog = (book: Book, type: "borrow" | "reserve") => {
    // Reset modal fields when opening
    setSelectedBook(book);
    setActionType(type);
    setNotes("");
    setUserName("");
    setPhoneNumber("");
    setReturnDate("");
    setIsDialogOpen(true);
  };

  // ================================
  // PHONE VALIDATION
  // ================================
  const isValidPhone = (phone: string) => {
    // Egyptian phone number format: starts with 01 + 9 digits
    return /^01[0-9]{9}$/.test(phone);
  };

  // ================================
  // BORROW BOOK
  // ================================
  const handleBorrow = () => {
    if (!selectedBook) return;

    // Validate required inputs
    if (!userName) return alert("Enter your name");
    if (!phoneNumber || !isValidPhone(phoneNumber))
      return alert("Enter a valid phone number");
    if (!returnDate) return alert("Select return date");
    if (isBookBorrowed(selectedBook.id))
      return alert("Already borrowed!");
    if (selectedBook.availableQuantity < 1)
      return alert("Book not available");

    setProcessingBookId(selectedBook.id); // Show loading state

    // Create borrowed book object
    const borrowedBook: BorrowedBook & { phoneNumber: string } = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(returnDate).toISOString(),
      notes,
      userName,
      phoneNumber,
    };

    // Update localStorage
    const updatedBorrowed = [...userBooks.borrowed, borrowedBook];
    localStorage.setItem("borrowedBooks", JSON.stringify(updatedBorrowed));

    // Update state
    setUserBooks((prev) => ({
      ...prev,
      borrowed: updatedBorrowed,
    }));

    // Reduce available quantity by 1
    setBooks((prev) =>
      prev.map((b) =>
        b.id === selectedBook.id
          ? { ...b, availableQuantity: b.availableQuantity - 1 }
          : b
      )
    );

    setProcessingBookId(null);
    setIsDialogOpen(false);
    alert("Book borrowed successfully ✅");
  };

  // ================================
  // RESERVE BOOK
  // ================================
  const handleReserve = () => {
    if (!selectedBook) return;

    // Validate required inputs
    if (!userName) return alert("Enter your name");
    if (!phoneNumber || !isValidPhone(phoneNumber))
      return alert("Enter a valid phone number");
    if (isBookReserved(selectedBook.id)) return alert("Already reserved!");

    // Create reserved book object
    const reservedBook: ReservedBook & { phoneNumber: string } = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      reserverName: userName,
      reservationDate: new Date().toISOString(),
      notes,
      phoneNumber,
    };

    // Update localStorage
    const updatedReserved = [...userBooks.reserved, reservedBook];
    localStorage.setItem("reservedBooks", JSON.stringify(updatedReserved));

    // Update state
    setUserBooks((prev) => ({
      ...prev,
      reserved: updatedReserved,
    }));

    setIsDialogOpen(false);
    alert("Book reserved successfully ✅");
  };

  // ================================
  // RENDER
  // ================================
  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">Book Catalog</h1>

      {/* SEARCH + CATEGORY FILTER */}
      <div className="flex gap-4">
        {/* Search by title or author */}
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Category dropdown */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BOOKS GRID */}
      <div className="grid grid-cols-4 gap-6">
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

      {/* MODAL FOR BORROW / RESERVE */}
      {isDialogOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded space-y-4 w-[400px]">
            {/* Modal Title */}
            <h2 className="text-xl font-bold">
              {actionType === "borrow" ? "Borrow Book" : "Reserve Book"}
            </h2>

            {/* Name Input */}
            <input
              className="w-full border p-2"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            {/* Phone Number Input */}
            <input
              className="w-full border p-2"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            {/* Borrow-only return date */}
            {actionType === "borrow" && (
              <input
                className="w-full border p-2"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            )}

            {/* Notes */}
            <textarea
              className="w-full border p-2"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Modal Actions */}
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={
                  actionType === "borrow" ? handleBorrow : handleReserve
                }
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
