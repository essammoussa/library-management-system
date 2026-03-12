import { useEffect, useState } from "react";
import { BorrowedBook, Book } from "@/data/books"; // Updated import
import booksData from "@/data/books.json";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/store/RoleContext";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BorrowedBooks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useRole();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // AlertDialog state
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [bookToReturn, setBookToReturn] = useState<string | null>(null);

  useEffect(() => {
    setAllBooks(booksData as Book[]);
    const borrowed = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");
    setBorrowedBooks(borrowed);
  }, []);

  const handleReturn = (bookId: string) => {
    setBookToReturn(bookId);
    setIsReturnDialogOpen(true);
  };

  const confirmReturn = () => {
    if (!bookToReturn) return;

    const updated = borrowedBooks.filter((b) => b.bookId !== bookToReturn);
    setBorrowedBooks(updated);
    localStorage.setItem("borrowedBooks", JSON.stringify(updated));

    // Restore book quantity
    setAllBooks((prev) =>
      prev.map((b) =>
        b.id === bookToReturn ? { ...b, availableQuantity: b.availableQuantity + 1 } : b
      )
    );

    setIsReturnDialogOpen(false);
    setBookToReturn(null);
    toast({ title: "Success", description: "Book returned successfully!" });
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 max-w-lg w-full">
          <BookOpen className="w-16 h-16 text-primary/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Track Your Books</h2>
          <p className="text-muted-foreground mb-8">Register now to keep track of your reading list and borrowed books.</p>
          <Button size="lg" className="w-full font-bold uppercase tracking-widest" onClick={() => navigate('/login?mode=register')}>
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Reading List</h1>
        <p className="text-muted-foreground mt-1 font-medium">Keep track of your current loans</p>
      </div>

      {borrowedBooks.length === 0 ? (
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 text-center">
          <p className="text-muted-foreground font-medium">You haven't borrowed any books yet. Visit the catalog to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {borrowedBooks.map((b) => {
            const bookInfo = allBooks.find((book) => book.id === b.bookId);
            if (!bookInfo) return null;

            return (
              <div
                key={b.bookId}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full"
              >
                {/* Book image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={bookInfo.image || "/placeholder.jpg"}
                    alt={bookInfo.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/90 text-white backdrop-blur-md shadow-sm">
                      On Loan
                    </span>
                  </div>
                </div>

                {/* Book details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-card-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{bookInfo.title}</h2>
                    <p className="text-sm text-muted-foreground/80 font-medium">{bookInfo.author}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-wider">Due Date</p>
                        <p className="text-xs font-bold text-red-600">{new Date(b.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="size-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed italic border-l-2 border-primary/10 pl-3">
                      "{b.notes}"
                    </p>
                  )}

                  <Button
                    variant="destructive"
                    className="mt-3 w-full rounded-xl py-6 font-bold text-xs uppercase tracking-widest shadow-lg active:scale-[0.98]"
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

      <AlertDialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to return this book to the library?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReturn}>Return</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BorrowedBooks;