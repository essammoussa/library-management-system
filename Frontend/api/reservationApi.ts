import axiosClient from "@/lib/axiosClient";
import { Reservation } from "@/data/reservations";

const BASE = "/v1/reservations";

export const reservationApi = {
  // Get all reservations
  getAll: async (params?: { status?: string; memberId?: string; bookId?: string }): Promise<Reservation[]> => {
    const res = await axiosClient.get(BASE, { params });
    return res.data.data;
  },

  // Get reservation by ID
  getById: async (id: string): Promise<Reservation | null> => {
    const res = await axiosClient.get(`${BASE}/${id}`);
    return res.data.data;
  },

  // Get active reservations
  getActive: async (): Promise<Reservation[]> => {
    const res = await axiosClient.get(BASE, { params: { status: "active" } });
    return res.data.data;
  },

  // Get by member
  getByMember: async (memberId: string): Promise<Reservation[]> => {
    const res = await axiosClient.get(`${BASE}/member/${memberId}`);
    return res.data.data;
  },

  // Get by book
  getByBook: async (bookId: string): Promise<Reservation[]> => {
    const res = await axiosClient.get(`${BASE}/book/${bookId}`);
    return res.data.data;
  },

  // Get by status
  getByStatus: async (status: Reservation["status"]): Promise<Reservation[]> => {
    const res = await axiosClient.get(BASE, { params: { status } });
    return res.data.data;
  },

  // Create reservation
  create: async (
    reservationData: Omit<Reservation, "id" | "priority">
  ): Promise<Reservation> => {
    const res = await axiosClient.post(BASE, reservationData);
    return res.data.data;
  },

  // Update reservation
  update: async (id: string, data: Partial<Reservation>): Promise<Reservation | null> => {
    const res = await axiosClient.put(`${BASE}/${id}`, data);
    return res.data.data;
  },

  // Cancel reservation
  cancel: async (id: string): Promise<Reservation | null> => {
    const res = await axiosClient.post(`${BASE}/${id}/cancel`);
    return res.data.data;
  },

  // Fulfill reservation
  fulfill: async (id: string): Promise<Reservation | null> => {
    const res = await axiosClient.post(`${BASE}/${id}/fulfill`);
    return res.data.data;
  },

  // Delete reservation
  delete: async (id: string): Promise<boolean> => {
    await axiosClient.delete(`${BASE}/${id}`);
    return true;
  },

  // Get next in queue
  getNextInQueue: async (bookId: string): Promise<Reservation | null> => {
    const res = await axiosClient.get(`${BASE}/book/${bookId}/next`);
    return res.data.data;
  },

  // Get statistics
  getStats: async (): Promise<{
    total: number;
    active: number;
    fulfilled: number;
    expired: number;
    cancelled: number;
  }> => {
    const res = await axiosClient.get(`${BASE}/stats`);
    return res.data.data;
  },
};
