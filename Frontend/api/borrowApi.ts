import axiosClient from "@/lib/axiosClient";
import { BorrowRecord } from "@/data/borrowing";

const BASE = "/v1/borrows";

export const borrowApi = {
  // Get all borrow records (supports ?status=&memberId=&bookId=)
  getAll: async (params?: { status?: string; memberId?: string; bookId?: string }): Promise<BorrowRecord[]> => {
    const res = await axiosClient.get(BASE, { params });
    return res.data.data;
  },

  // Get borrow record by ID
  getById: async (id: string): Promise<BorrowRecord | null> => {
    const res = await axiosClient.get(`${BASE}/${id}`);
    return res.data.data;
  },

  // Get active borrows
  getActive: async (): Promise<BorrowRecord[]> => {
    const res = await axiosClient.get(BASE, { params: { status: "active" } });
    return res.data.data;
  },

  // Get overdue borrows
  getOverdue: async (): Promise<BorrowRecord[]> => {
    const res = await axiosClient.get(BASE, { params: { status: "overdue" } });
    return res.data.data;
  },

  // Get by member
  getByMember: async (memberId: string): Promise<BorrowRecord[]> => {
    const res = await axiosClient.get(BASE, { params: { memberId } });
    return res.data.data;
  },

  // Get by book
  getByBook: async (bookId: string): Promise<BorrowRecord[]> => {
    const res = await axiosClient.get(BASE, { params: { bookId } });
    return res.data.data;
  },

  // Create borrow record (checkout)
  create: async (
    borrowData: Omit<BorrowRecord, "id" | "returnDate" | "fine">
  ): Promise<BorrowRecord> => {
    const payload = {
      bookId: borrowData.bookId,
      memberId: borrowData.memberId,
      memberName: borrowData.memberName,
      borrowDate: borrowData.borrowDate,
      dueDate: borrowData.dueDate,
    };
    const res = await axiosClient.post(BASE, payload);
    return res.data.data;
  },

  // Update borrow record
  update: async (id: string, data: Partial<BorrowRecord>): Promise<BorrowRecord | null> => {
    const res = await axiosClient.put(`${BASE}/${id}`, data);
    return res.data.data;
  },

  // Return book
  returnBook: async (id: string, returnDate: string): Promise<BorrowRecord | null> => {
    const res = await axiosClient.post(`${BASE}/${id}/return`, { returnDate });
    return res.data.data;
  },

  // Delete borrow record
  delete: async (id: string): Promise<boolean> => {
    await axiosClient.delete(`${BASE}/${id}`);
    return true;
  },

  // Renew borrow
  renew: async (id: string, newDueDate: string): Promise<BorrowRecord | null> => {
    const res = await axiosClient.post(`${BASE}/${id}/renew`, { newDueDate });
    return res.data.data;
  },

  // Get statistics
  getStats: async (): Promise<{
    total: number;
    active: number;
    overdue: number;
    returned: number;
  }> => {
    const res = await axiosClient.get(`${BASE}/stats`);
    return res.data.data;
  },
};
