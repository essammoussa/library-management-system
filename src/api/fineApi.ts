import axiosClient from '@/lib/axiosClient';

export interface Fine {
  _id?: string;
  id?: string;
  userId: string;
  borrowId: string;
  amount: number;
  isPaid: boolean;
  createdAt?: Date;
  paidAt?: Date;
}

export const fineApi = {
  // Get unpaid fines for a user
  getUnpaidFines: async (userId: string): Promise<Fine[]> => {
    try {
      const response = await axiosClient.get(`/fines/unpaid/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unpaid fines:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Get all fines for a user
  getUserFines: async (userId: string): Promise<Fine[]> => {
    try {
      const response = await axiosClient.get(`/fines/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user fines:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Pay a fine
  payFine: async (fineId: string): Promise<Fine> => {
    try {
      const response = await axiosClient.post(`/fines/pay/${fineId}`);
      return response.data.fine || response.data;
    } catch (error) {
      console.error('Error paying fine:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Get all fines (admin only)
  getAllFines: async (): Promise<Fine[]> => {
    try {
      const response = await axiosClient.get('/fines/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all fines:', error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  // Calculate fine for overdue book
  calculateFine: (daysOverdue: number, ratePerDay: number = 0.5): number => {
    return Math.max(daysOverdue * ratePerDay, 0);
  },
};
