import axiosClient from '@/lib/axiosClient';

export interface Book {
  _id?: string;
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string[] | string;
  status: 'available' | 'borrowed' | 'reserved' | 'pending';
  publishYear: number;
  quantity?: number;
  availableQuantity?: number;
  totalCopies?: number;
  availableCopies?: number;
  coverUrl?: string;
}

export const bookApi = {
  // Get all books
  getAll: async (): Promise<Book[]> => {
    try {
      const response = await axiosClient.get('/v1/books');
      return response.data.data.books || response.data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },

  // Get single book
  getById: async (id: string): Promise<Book | null> => {
    try {
      const response = await axiosClient.get(`/v1/books/${id}`);
      return response.data.data.book || response.data;
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },

  // Search books
  search: async (query: string): Promise<Book[]> => {
    try {
      const response = await axiosClient.get('/v1/books', {
        params: { search: query },
      });
      return response.data.data.books || response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  // Filter by category
  getByCategory: async (category: string): Promise<Book[]> => {
    try {
      const response = await axiosClient.get('/v1/books', {
        params: { category },
      });
      return response.data.data.books || response.data;
    } catch (error) {
      console.error('Error fetching books by category:', error);
      throw error;
    }
  },

  // Filter by status
  getByStatus: async (status: string): Promise<Book[]> => {
    try {
      const response = await axiosClient.get('/v1/books', {
        params: { status },
      });
      return response.data.data.books || response.data;
    } catch (error) {
      console.error('Error fetching books by status:', error);
      throw error;
    }
  },

  // Create new book (admin only)
  create: async (bookData: Omit<Book, 'id' | '_id'>): Promise<Book> => {
    try {
      const response = await axiosClient.post('/v1/books', bookData);
      return response.data.data.book || response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Update book (admin only)
  update: async (id: string, bookData: Partial<Book>): Promise<Book | null> => {
    try {
      const response = await axiosClient.patch(`/v1/books/${id}`, bookData);
      return response.data.data.book || response.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  // Delete book (admin only)
  delete: async (id: string): Promise<boolean> => {
    try {
      await axiosClient.delete(`/v1/books/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await axiosClient.get('/v1/books');
      const books = response.data.data.books || response.data;
      const categories = new Set<string>();
      books.forEach((book: Book) => {
        if (Array.isArray(book.category)) {
          book.category.forEach((cat) => categories.add(cat));
        } else {
          categories.add(book.category);
        }
      });
      return Array.from(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};
