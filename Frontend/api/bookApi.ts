import axiosClient from "@/lib/axiosClient";
import { Book } from "@/data/books";

const BASE = "/v1/books";

export const bookApi = {
  // Get all books (supports ?search=&category=&status=&available=)
  getAll: async (params?: { search?: string; category?: string; status?: string; available?: string }): Promise<Book[]> => {
    const res = await axiosClient.get(BASE, { params });
    return res.data.data;
  },

  // Get book by ID
  getById: async (id: string): Promise<Book | null> => {
    const res = await axiosClient.get(`${BASE}/${id}`);
    return res.data.data;
  },

  // Search books
  search: async (query: string): Promise<Book[]> => {
    const res = await axiosClient.get(BASE, { params: { search: query } });
    return res.data.data;
  },

  // Filter by category
  getByCategory: async (category: string): Promise<Book[]> => {
    const res = await axiosClient.get(BASE, { params: { category } });
    return res.data.data;
  },

  // Filter by status
  getByStatus: async (status: Book["status"]): Promise<Book[]> => {
    const res = await axiosClient.get(BASE, { params: { status } });
    return res.data.data;
  },

  // Create new book
  create: async (bookData: Omit<Book, "id">): Promise<Book> => {
    const formData = new FormData();
    Object.entries(bookData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    const res = await axiosClient.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Update book
  update: async (id: string, bookData: Partial<Book>): Promise<Book | null> => {
    const formData = new FormData();
    Object.entries(bookData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    const res = await axiosClient.put(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Delete book
  delete: async (id: string): Promise<boolean> => {
    await axiosClient.delete(`${BASE}/${id}`);
    return true;
  },

  // Bulk delete — sequential calls since no bulk endpoint yet
  bulkDelete: async (ids: string[]): Promise<number> => {
    let count = 0;
    for (const id of ids) {
      try {
        await axiosClient.delete(`${BASE}/${id}`);
        count++;
      } catch {
        // continue
      }
    }
    return count;
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const res = await axiosClient.get(`${BASE}/categories`);
    return res.data.data;
  },
};
