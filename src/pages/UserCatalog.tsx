import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/store/RoleContext";
import { BookCard } from "@/components/books/BookCard";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

const UserCatalog = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 8; // Adjust based on grid layout (4 columns -> 2 rows)

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

  // Reset pagination when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, categoryFilter, statusFilter]);

  const paginatedBooks = filteredBooks.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  const isBookBorrowed = (bookId: string) =>
    userBooks.borrowed.some((b) => b.bookId === bookId);

  const isBookReserved = (bookId: string) =>
    userBooks.reserved.some((r) => r.bookId === bookId);

  const openForm = (book: Book, type: "borrow" | "reserve") => {
    if (!isAuthenticated) {
      toast({
        title: "Registration Required",
        description: "Please create an account to borrow or reserve books.",
      });
      navigate("/login?mode=register");
      return;
    }
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
    if (!userName) return toast({ title: "Error", description: "Enter your name", variant: "destructive" });
    if (!phoneNumber || !isValidPhone(phoneNumber))
      return toast({ title: "Error", description: "Enter a valid phone number", variant: "destructive" });
    if (!returnDate) return toast({ title: "Error", description: "Select return date", variant: "destructive" });
    if (isBookBorrowed(selectedBook.id)) return toast({ title: "Error", description: "Already borrowed!", variant: "destructive" });
    if (selectedBook.availableQuantity < 1) return toast({ title: "Error", description: "Book not available", variant: "destructive" });

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
    toast({ title: "Success", description: "Book borrowed successfully ✅" });
  };

  const handleReserve = () => {
    if (!selectedBook) return;
    if (!userName) return toast({ title: "Error", description: "Enter your name", variant: "destructive" });
    if (!phoneNumber || !isValidPhone(phoneNumber))
      return toast({ title: "Error", description: "Enter a valid phone number", variant: "destructive" });
    if (isBookReserved(selectedBook.id)) return toast({ title: "Error", description: "Already reserved!", variant: "destructive" });

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
    toast({ title: "Success", description: "Book reserved successfully ✅" });
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Discovery</h1>
          <p className="text-muted-foreground mt-1 font-medium">Explore our vast collection of literature</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/40 backdrop-blur-md p-4 rounded-2xl border border-border/40 shadow-sm leading-none">
        <div className="flex-1 relative">
          <Input
            placeholder="Search titles, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 h-11 bg-background/50 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl transition-all"
          />
        </div>

        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] h-11 bg-background/50 border-none ring-1 ring-border/50 focus-visible:ring-primary/50 rounded-xl px-4 font-semibold text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl">
              <SelectItem value="all">Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c} className="font-medium">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 items-stretch">
        {paginatedBooks.map((book) => (
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

      {filteredBooks.length > 0 && (
        <div className="flex items-center justify-between mt-6 bg-card p-4 border rounded-lg">
          <div className="text-sm text-muted-foreground">
            Showing {pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, filteredBooks.length)} of{" "}
            {filteredBooks.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap px-2">
              Page {pageIndex + 1} of {Math.ceil(filteredBooks.length / pageSize) || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={(pageIndex + 1) * pageSize >= filteredBooks.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageIndex(Math.ceil(filteredBooks.length / pageSize) - 1)}
              disabled={(pageIndex + 1) * pageSize >= filteredBooks.length}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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