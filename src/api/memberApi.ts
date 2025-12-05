import axiosClient from '@/lib/axiosClient';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  fines?: number;
  createdAt?: Date;
}

export const memberApi = {
  // Get all members (admin only)
  getAll: async (): Promise<User[]> => {
    try {
      const response = await axiosClient.get('/users');
      return response.data.data?.users || response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Get single member (admin only or own profile)
  getById: async (userId: string): Promise<User> => {
    try {
      const response = await axiosClient.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  // Update member (admin only or own profile)
  update: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await axiosClient.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  // Delete member (admin only)
  delete: async (userId: string): Promise<boolean> => {
    try {
      await axiosClient.delete(`/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  // Get member statistics (admin only)
  getStats: async (): Promise<any> => {
    try {
      const response = await axiosClient.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching member stats:', error);
      throw error;
    }
  },
};
