import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { bookApi } from "@/api/bookApi";
import { Book } from "@/data/books";

// Define the state structure for books
interface BooksState {
  books: Book[];            // All books in the system
  currentBook: Book | null; // Single book selected for details/edit
  categories: string[];     // Book categories
  loading: boolean;         // Loading state for async actions
  error: string | null;     // Error messages
}

// Initial state
const initialState: BooksState = {
  books: [],
  currentBook: null,
  categories: [],
  loading: false,
  error: null,
};

// ------------------- ASYNC THUNKS ------------------- //
// These are async actions that call the API and handle data

export const fetchBooks = createAsyncThunk("books/fetchAll", async () => {
  return await bookApi.getAll(); // Get all books
});

export const fetchBookById = createAsyncThunk(
  "books/fetchById",
  async (id: string) => {
    return await bookApi.getById(id); // Get a single book by ID
  }
);

export const searchBooks = createAsyncThunk(
  "books/search",
  async (query: string) => {
    return await bookApi.search(query); // Search books by title/author
  }
);

export const fetchBooksByCategory = createAsyncThunk(
  "books/fetchByCategory",
  async (category: string) => {
    return await bookApi.getByCategory(category); // Filter books by category
  }
);

export const fetchBooksByStatus = createAsyncThunk(
  "books/fetchByStatus",
  async (status: Book["status"]) => {
    return await bookApi.getByStatus(status); // Filter books by availability
  }
);

export const createBook = createAsyncThunk(
  "books/create",
  async (bookData: Omit<Book, "id">) => {
    return await bookApi.create(bookData); // Create a new book
  }
);

export const updateBook = createAsyncThunk(
  "books/update",
  async ({ id, data }: { id: string; data: Partial<Book> }) => {
    return await bookApi.update(id, data); // Update an existing book
  }
);

export const deleteBook = createAsyncThunk(
  "books/delete",
  async (id: string) => {
    await bookApi.delete(id); // Delete a book
    return id; // Return the deleted book ID
  }
);

export const bulkDeleteBooks = createAsyncThunk(
  "books/bulkDelete",
  async (ids: string[]) => {
    await bookApi.bulkDelete(ids); // Delete multiple books
    return ids; // Return the deleted IDs
  }
);

export const fetchCategories = createAsyncThunk(
  "books/fetchCategories",
  async () => {
    return await bookApi.getCategories(); // Get all categories
  }
);

// ------------------- SLICE ------------------- //
const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Reset error
    },
    clearCurrentBook: (state) => {
      state.currentBook = null; // Reset selected book
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch all books ---
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch books";
      })

      // --- Fetch book by ID ---
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch book";
      })

      // --- Search books ---
      .addCase(searchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(searchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search books";
      })

      // --- Filter by category ---
      .addCase(fetchBooksByCategory.fulfilled, (state, action) => {
        state.books = action.payload;
      })

      // --- Filter by status ---
      .addCase(fetchBooksByStatus.fulfilled, (state, action) => {
        state.books = action.payload;
      })

      // --- Create book ---
      .addCase(createBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books.push(action.payload);
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create book";
      })

      // --- Update book ---
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.books.findIndex((b) => b.id === action.payload!.id);
          if (index !== -1) state.books[index] = action.payload;
          if (state.currentBook?.id === action.payload.id) state.currentBook = action.payload;
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update book";
      })

      // --- Delete book ---
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((b) => b.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete book";
      })

      // --- Bulk delete ---
      .addCase(bulkDeleteBooks.fulfilled, (state, action) => {
        state.books = state.books.filter((b) => !action.payload.includes(b.id));
      })

      // --- Fetch categories ---
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

// Export actions
export const { clearError, clearCurrentBook } = booksSlice.actions;

// Export reducer
export default booksSlice.reducer;
