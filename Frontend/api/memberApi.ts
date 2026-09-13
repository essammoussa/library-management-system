import axiosClient from "@/lib/axiosClient";
import { Member } from "@/data/members";

const BASE = "/v1/members";

export const memberApi = {
  // Get all members
  getAll: async (): Promise<Member[]> => {
    const res = await axiosClient.get(BASE);
    return res.data.data;
  },

  // Get member by ID
  getById: async (id: string): Promise<Member | null> => {
    const res = await axiosClient.get(`${BASE}/${id}`);
    return res.data.data;
  },

  // Search members — uses backend ?search= filter if supported, else client-side
  search: async (query: string): Promise<Member[]> => {
    const all = await memberApi.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(
      (member) =>
        member.name.toLowerCase().includes(lowerQuery) ||
        member.email.toLowerCase().includes(lowerQuery) ||
        member.membershipId?.toLowerCase().includes(lowerQuery) ||
        member.phone?.includes(lowerQuery)
    );
  },

  // Filter by status
  getByStatus: async (status: Member["status"]): Promise<Member[]> => {
    const all = await memberApi.getAll();
    return all.filter((member) => member.status === status);
  },

  // Get active members
  getActive: async (): Promise<Member[]> => {
    const all = await memberApi.getAll();
    return all.filter((member) => member.status === "active");
  },

  // Create new member
  create: async (memberData: Omit<Member, "id">): Promise<Member> => {
    const res = await axiosClient.post(BASE, memberData);
    return res.data.data;
  },

  // Update member
  update: async (id: string, memberData: Partial<Member>): Promise<Member | null> => {
    const res = await axiosClient.put(`${BASE}/${id}`, memberData);
    return res.data.data;
  },

  // Delete member
  delete: async (id: string): Promise<boolean> => {
    await axiosClient.delete(`${BASE}/${id}`);
    return true;
  },

  // Suspend member
  suspend: async (id: string): Promise<Member | null> => {
    const res = await axiosClient.post(`${BASE}/${id}/suspend`);
    return res.data.data;
  },

  // Activate member
  activate: async (id: string): Promise<Member | null> => {
    const res = await axiosClient.post(`${BASE}/${id}/activate`);
    return res.data.data;
  },

  // Get member statistics
  getStats: async (id: string): Promise<{ borrowedBooks: number; totalBorrowed: number } | null> => {
    const res = await axiosClient.get(`${BASE}/stats`);
    return res.data.data;
  },
};
