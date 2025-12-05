import axiosClient from '@/lib/axiosClient';

export interface BorrowRecord {
  _id?: string;
  id?: string;
  userId: string;
  bookId: string;
  borrowedAt?: Date;
  dueDate: Date;
  returnedAt?: Date | null;
  fineAmount?: number;
  status?: 'active' | 'overdue' | 'returned';
}

export const borrowApi = {
  // Borrow a book
  borrowBook: async (bookId: string, userId?: string): Promise<any> => {
    try {
      const response = await axiosClient.post(`/v1/borrow/${bookId}`, {
        userId: userId || localStorage.getItem('userId'),
      });
      return response.data;
    } catch (error) {
      console.error('Error borrowing book:', error);
      throw error;
    }
  },

  // Return a book
  returnBook: async (bookId: string, userId?: string): Promise<any> => {
    try {
      const response = await axiosClient.post(`/v1/return/${bookId}`, {
        userId: userId || localStorage.getItem('userId'),
      });
      return response.data;
    } catch (error) {
      console.error('Error returning book:', error);
      throw error;
    }
  },

  // Get borrow history for a user
  getBorrowHistory: async (userId: string): Promise<BorrowRecord[]> => {
    try {
      const response = await axiosClient.get(`/v1/borrow/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching borrow history:', error);
      throw error;
    }
  },

  // Get active borrows
  getActiveBorrows: async (): Promise<BorrowRecord[]> => {
    try {
      const response = await axiosClient.get('/v1/borrow/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active borrows:', error);
      throw error;
    }
  },

  // Get overdue books
  getOverdueBooks: async (): Promise<any[]> => {
    try {
      const response = await axiosClient.get('/api/reports/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue books:', error);
      throw error;
    }
  },

  // Renew borrow
  renew: async (
    id: string,
    newDueDate: string
  ): Promise<BorrowRecord | null> => {
    await delay();
    const index = borrowStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    borrowStore[index].dueDate = newDueDate;
    return { ...borrowStore[index] };
  },

  // Get statistics
  getStats: async (): Promise<{
    total: number;
    active: number;
    overdue: number;
    returned: number;
  }> => {
    await delay();
    return {
      total: borrowStore.length,
      active: borrowStore.filter((r) => r.status === 'active').length,
      overdue: borrowStore.filter((r) => r.status === 'overdue').length,
      returned: borrowStore.filter((r) => r.status === 'returned').length,
    };
  },
};
