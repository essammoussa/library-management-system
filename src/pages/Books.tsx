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
  const handleDeleteBook = async (id: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await dispatch(deleteBook(id)).unwrap(); // Call deleteBook action
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
      }
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
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Books</h1>
          <p className="text-muted-foreground">
            Manage your library's book inventory
          </p>
        </div>
        {/* Add Book Button */}
        <Button onClick={handleAddBook}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
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
    </div>
  );
};

export default Books;
