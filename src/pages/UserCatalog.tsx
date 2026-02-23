import { useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const UserCatalog = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [userBooks, setUserBooks] = useState<UserBookState>({
    borrowed: [],
    reserved: [],
  });

  const [processingBookId, setProcessingBookId] = useState<string | null>(null);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionType, setActionType] = useState<"borrow" | "reserve" | null>(null);

  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [notes, setNotes] = useState("");

  // Load books + localStorage
  useEffect(() => {
    setTimeout(() => {
      setBooks(booksData as Book[]);
      setLoading(false);
    }, 300);

    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");
    const reserved = JSON.parse(localStorage.getItem("reservedBooks") || "[]");
    setUserBooks({ borrowed, reserved });
  }, []);

  const categories = Array.from(new Set(books.map((b) => b.category))).sort();

  const filteredBooks = books.filter((book) => {
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

  const isBookBorrowed = (bookId: string) =>
    userBooks.borrowed.some((b) => b.bookId === bookId);

  const isBookReserved = (bookId: string) =>
    userBooks.reserved.some((r) => r.bookId === bookId);

  const openForm = (book: Book, type: "borrow" | "reserve") => {
    setSelectedBook(book);
    setActionType(type);
    setUserName("");
    setPhoneNumber("");
    setReturnDate("");
    setNotes("");
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const isValidPhone = (phone: string) => /^01[0-9]{9}$/.test(phone);

  const handleBorrow = () => {
    if (!selectedBook) return;
    if (!userName) return alert("Enter your name");
    if (!phoneNumber || !isValidPhone(phoneNumber))
      return alert("Enter a valid phone number");
    if (!returnDate) return alert("Select return date");
    if (isBookBorrowed(selectedBook.id)) return alert("Already borrowed!");
    if (selectedBook.availableQuantity < 1) return alert("Book not available");

    setProcessingBookId(selectedBook.id);

    const borrowedBook: BorrowedBook & { phoneNumber: string } = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(returnDate).toISOString(),
      notes,
      userName,
      phoneNumber,
    };

    const updatedBorrowed = [...userBooks.borrowed, borrowedBook];
    localStorage.setItem("borrowedBooks", JSON.stringify(updatedBorrowed));

    setUserBooks((prev) => ({ ...prev, borrowed: updatedBorrowed }));

    setBooks((prev) =>
      prev.map((b) =>
        b.id === selectedBook.id
          ? { ...b, availableQuantity: b.availableQuantity - 1 }
          : b
      )
    );

    setProcessingBookId(null);
    setIsFormOpen(false);
    alert("Book borrowed successfully ✅");
  };

  const handleReserve = () => {
    if (!selectedBook) return;
    if (!userName) return alert("Enter your name");
    if (!phoneNumber || !isValidPhone(phoneNumber))
      return alert("Enter a valid phone number");
    if (isBookReserved(selectedBook.id)) return alert("Already reserved!");

    const reservedBook: ReservedBook & { phoneNumber: string } = {
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      reserverName: userName,
      reservationDate: new Date().toISOString(),
      notes,
      phoneNumber,
    };

    const updatedReserved = [...userBooks.reserved, reservedBook];
    localStorage.setItem("reservedBooks", JSON.stringify(updatedReserved));

    setUserBooks((prev) => ({ ...prev, reserved: updatedReserved }));

    setIsFormOpen(false);
    alert("Book reserved successfully ✅");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Book Catalog</h1>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

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

      <div className="grid grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onBorrow={() => openForm(book, "borrow")}
            onReserve={() => openForm(book, "reserve")}
            isBorrowed={isBookBorrowed(book.id)}
            isReserved={isBookReserved(book.id)}
            isLoading={processingBookId === book.id}
          />
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionType === "borrow" ? "Borrow Book" : "Reserve Book"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <Input
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {actionType === "borrow" && (
              <Input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            )}
            <textarea
              className="w-full border p-2"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-between">
              <Button variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
              <Button
                onClick={actionType === "borrow" ? handleBorrow : handleReserve}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserCatalog;