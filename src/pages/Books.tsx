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
  const dispatch = useAppDispatch();
  const { books, categories, loading, error } = useAppSelector(
    (state) => state.books
  );
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);

  useEffect(() => {
    dispatch(fetchBooks());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    }
  }, [error, toast]);

  const handleAddBook = () => {
    setEditingBook(undefined);
    setIsFormOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsFormOpen(true);
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm("Are you sure you want to delete this book?")) {
      try {
        await dispatch(deleteBook(id)).unwrap();
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

  const handleSubmitForm = async (data: Omit<Book, "id"> | Book) => {
    try {
      if ("id" in data) {
        await dispatch(updateBook({ id: data.id, data })).unwrap();
        toast({
          title: "Success",
          description: "Book updated successfully",
        });
      } else {
        await dispatch(createBook(data)).unwrap();
        toast({
          title: "Success",
          description: "Book added successfully",
        });
      }
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

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBook(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Books</h1>
          <p className="text-muted-foreground">
            Manage your library's book inventory
          </p>
        </div>
        <Button onClick={handleAddBook}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <BookList
        books={books}
        categories={categories}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
        isLoading={loading}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            book={editingBook}
            categories={categories}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            isLoading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Books;
