import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBooks,
  fetchCategories,
  createBook,
  updateBook,
  deleteBook,
} from "@/store/slices/booksSlice";
import { BookList } from "@/components/books/BookList";
import { BookForm } from "@/components/books/BookForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus } from "lucide-react";
import { Book } from "@/data/books";
import { useToast } from "@/hooks/use-toast";

const Books = () => {
  const dispatch = useAppDispatch(); // Redux dispatch function
  const { books, categories, loading, error } = useAppSelector(
    (state) => state.books
  ); // Access books slice state
  const { toast } = useToast(); // Toast for notifications

  // Local state for controlling dialog and editing book
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

  // AlertDialog state for deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);

  // Fetch books and categories when component mounts
  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Show toast if there is an error in fetching books/categories
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  // Open dialog to add a new book
  const handleAddBook = () => {
    setEditingBook(undefined); // No book is being edited
    setIsFormOpen(true); // Open the dialog
  };

  // Open dialog to edit an existing book
  const handleEditBook = (book: Book) => {
    setEditingBook(book); // Set the book being edited
    setIsFormOpen(true); // Open the dialog
  };

  // Delete a book after confirming with the user
  const handleDeleteBook = (id: string) => {
    setBookToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await dispatch(deleteBook(bookToDelete)).unwrap(); // Call deleteBook action
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete book",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  // Handle form submission for adding/updating a book
  const handleSubmitForm = async (data: Omit<Book, "id"> | Book) => {
    try {
      if ("id" in data) {
        // If book has an id, it's an update
        await dispatch(updateBook({ id: data.id, data })).unwrap();
        toast({
          title: "Success",
          description: "Book updated successfully",
        });
      } else {
        // Otherwise, it's a new book
        await dispatch(createBook(data)).unwrap();
        toast({
          title: "Success",
          description: "Book added successfully",
        });
      }
      // Close dialog and reset editingBook state
      setIsFormOpen(false);
      setEditingBook(undefined);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save book",
      });
    }
  };

  // Close the form without saving
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBook(undefined);
  };

  return (
    <div className="space-y-6 font-sans-ui text-ink-primary">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-archival pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-status-available animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-archival-teal">
              Archival Repository Stacks
            </span>
          </div>
          <h1 className="font-serif-display text-3xl font-bold text-archival-teal tracking-tight">
            Inventory &amp; Repository Stacks
          </h1>
          <p className="font-serif-body text-xs italic text-ink-muted mt-0.5">
            Comprehensive registry of physical folios, open circulating items, and accessions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddBook}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-archival-teal hover:bg-archival-deep text-white text-xs font-semibold shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Accession New Tome</span>
        </button>
      </div>

      {/* Book List Table */}
      <BookList
        books={books}
        categories={categories}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
        isLoading={loading}
      />

      {/* Add/Edit Book Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            book={editingBook} // Pass the book to edit, or undefined for new
            categories={categories}
            onSubmit={handleSubmitForm} // Handle save
            onCancel={handleCloseForm} // Handle cancel
            isLoading={loading} // Show loading state if needed
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book
              from the library inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBook} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Books;
