import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { bookApi } from "@/api/bookApi";
import { Book } from "@/data/books";

interface BooksState {
  books: Book[];
  currentBook: Book | null;
  categories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  currentBook: null,
  categories: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchBooks = createAsyncThunk("books/fetchAll", async () => {
  return await bookApi.getAll();
});

export const fetchBookById = createAsyncThunk(
  "books/fetchById",
  async (id: string) => {
    return await bookApi.getById(id);
  }
);

export const searchBooks = createAsyncThunk(
  "books/search",
  async (query: string) => {
    return await bookApi.search(query);
  }
);

export const fetchBooksByCategory = createAsyncThunk(
  "books/fetchByCategory",
  async (category: string) => {
    return await bookApi.getByCategory(category);
  }
);

export const fetchBooksByStatus = createAsyncThunk(
  "books/fetchByStatus",
  async (status: Book["status"]) => {
    return await bookApi.getByStatus(status);
  }
);

export const createBook = createAsyncThunk(
  "books/create",
  async (bookData: Omit<Book, "id">) => {
    return await bookApi.create(bookData);
  }
);

export const updateBook = createAsyncThunk(
  "books/update",
  async ({ id, data }: { id: string; data: Partial<Book> }) => {
    return await bookApi.update(id, data);
  }
);

export const deleteBook = createAsyncThunk(
  "books/delete",
  async (id: string) => {
    await bookApi.delete(id);
    return id;
  }
);

export const bulkDeleteBooks = createAsyncThunk(
  "books/bulkDelete",
  async (ids: string[]) => {
    await bookApi.bulkDelete(ids);
    return ids;
  }
);

export const fetchCategories = createAsyncThunk(
  "books/fetchCategories",
  async () => {
    return await bookApi.getCategories();
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all books
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
      // Fetch book by ID
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
      // Search books
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
      // Fetch by category
      .addCase(fetchBooksByCategory.fulfilled, (state, action) => {
        state.books = action.payload;
      })
      // Fetch by status
      .addCase(fetchBooksByStatus.fulfilled, (state, action) => {
        state.books = action.payload;
      })
      // Create book
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
      // Update book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.books.findIndex((b) => b.id === action.payload!.id);
          if (index !== -1) {
            state.books[index] = action.payload;
          }
          if (state.currentBook?.id === action.payload.id) {
            state.currentBook = action.payload;
          }
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update book";
      })
      // Delete book
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
      // Bulk delete
      .addCase(bulkDeleteBooks.fulfilled, (state, action) => {
        state.books = state.books.filter((b) => !action.payload.includes(b.id));
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearError, clearCurrentBook } = booksSlice.actions;
export default booksSlice.reducer;
