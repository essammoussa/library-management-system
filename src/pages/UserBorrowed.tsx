import { useEffect, useState } from "react";
import { BorrowedBook, Book } from "@/data/books"; // Updated import
import booksData from "@/data/books.json";
import { Button } from "@/components/ui/button";

const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  useEffect(() => {
    setAllBooks(booksData as Book[]);
    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");
    setBorrowedBooks(borrowed);
  }, []);

  const handleReturn = (bookId: string) => {
    if (!confirm("Are you sure you want to return this book?")) return;

    const updated = borrowedBooks.filter((b) => b.bookId !== bookId);
    setBorrowedBooks(updated);
    localStorage.setItem("borrowedBooks", JSON.stringify(updated));

    // Restore book quantity
    setAllBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, availableQuantity: b.availableQuantity + 1 } : b
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Borrowed Books</h1>

      {borrowedBooks.length === 0 ? (
        <p className="text-muted-foreground">You haven't borrowed any books yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {borrowedBooks.map((b) => {
            const bookInfo = allBooks.find((book) => book.id === b.bookId);
            if (!bookInfo) return null;

            return (
              <div
                key={b.bookId}
                className="border rounded-lg shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow"
              >
                {/* Book image */}
                <img
                  src={bookInfo.image || "/placeholder.jpg"}
                  alt={bookInfo.title}
                  className="h-48 w-full object-cover rounded-t-lg"
                />

                {/* Book details */}
                <div className="p-4 space-y-2">
                  <h2 className="text-lg font-semibold">{bookInfo.title}</h2>
                  <p className="text-sm text-muted-foreground">{bookInfo.author}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-primary text-white px-2 py-1 rounded text-xs">
                      Borrowed: {new Date(b.borrowDate).toLocaleDateString()}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Due: {new Date(b.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-sm text-gray-600">Notes: {b.notes}</p>
                  )}

                  <Button
                    variant="destructive"
                    className="mt-3 w-full"
                    onClick={() => handleReturn(b.bookId)}
                  >
                    Return Book
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BorrowedBooks;