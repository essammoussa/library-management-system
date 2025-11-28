import { mockBooks, Book } from "@/data/books";

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory store (simulates database)
let booksStore = [...mockBooks];

export const bookApi = {
  // Get all books
  getAll: async (): Promise<Book[]> => {
    await delay();
    return [...booksStore];
  },

  // Get book by ID
  getById: async (id: string): Promise<Book | null> => {
    await delay();
    const book = booksStore.find((b) => b.id === id);
    return book ? { ...book } : null;
  },

  // Search books
  search: async (query: string): Promise<Book[]> => {
    await delay();
    const lowerQuery = query.toLowerCase();
    return booksStore.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.isbn.includes(lowerQuery)
    );
  },

  // Filter by category
  getByCategory: async (category: string): Promise<Book[]> => {
    await delay();
    return booksStore.filter((book) => book.category === category);
  },

  // Filter by status
  getByStatus: async (status: Book["status"]): Promise<Book[]> => {
    await delay();
    return booksStore.filter((book) => book.status === status);
  },

  // Create new book
  create: async (bookData: Omit<Book, "id">): Promise<Book> => {
    await delay();
    const newBook: Book = {
      ...bookData,
      id: String(Date.now()), // Generate simple ID
    };
    booksStore.push(newBook);
    return { ...newBook };
  },

  // Update book
  update: async (id: string, bookData: Partial<Book>): Promise<Book | null> => {
    await delay();
    const index = booksStore.findIndex((b) => b.id === id);
    if (index === -1) return null;

    booksStore[index] = { ...booksStore[index], ...bookData };
    return { ...booksStore[index] };
  },

  // Delete book
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const initialLength = booksStore.length;
    booksStore = booksStore.filter((b) => b.id !== id);
    return booksStore.length < initialLength;
  },

  // Bulk operations
  bulkDelete: async (ids: string[]): Promise<number> => {
    await delay();
    const initialLength = booksStore.length;
    booksStore = booksStore.filter((b) => !ids.includes(b.id));
    return initialLength - booksStore.length;
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    await delay();
    const categories = new Set(booksStore.map((b) => b.category));
    return Array.from(categories);
  },
};
