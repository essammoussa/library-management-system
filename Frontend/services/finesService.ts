import axiosClient from '@/lib/axiosClient';
import { Fine } from '@/types/Fine';

const BASE = '/v1/fines';

class FineService {
  /**
   * GET ALL - Fetch all fines (admin)
   */
  async getAllFines(params?: { status?: string; memberId?: string }): Promise<Fine[]> {
    const res = await axiosClient.get(BASE, { params });
    return res.data.data;
  }

  /**
   * GET BY ID - Fetch single fine
   */
  async getFineById(id: string): Promise<Fine | null> {
    const res = await axiosClient.get(`${BASE}/${id}`);
    return res.data.data;
  }

  /**
   * GET BY MEMBER - Fetch fines for a specific member
   */
  async getFinesByMember(memberId: string): Promise<Fine[]> {
    const res = await axiosClient.get(`${BASE}/member/${memberId}`);
    return res.data.data;
  }

  /**
   * CREATE - Add new fine
   */
  async createFine(fineData: Omit<Fine, 'id' | 'createdAt'>): Promise<Fine> {
    const res = await axiosClient.post(BASE, fineData);
    return res.data.data;
  }

  /**
   * UPDATE - Update existing fine
   */
  async updateFine(id: string, updates: Partial<Fine>): Promise<Fine> {
    const res = await axiosClient.put(`${BASE}/${id}`, updates);
    return res.data.data;
  }

  /**
   * MARK AS PAID - Special update for payment
   */
  async markAsPaid(id: string, notes?: string): Promise<Fine> {
    const res = await axiosClient.post(`${BASE}/${id}/pay`, { notes });
    return res.data.data;
  }

  /**
   * WAIVE FINE - Waive a fine with reason
   */
  async waiveFine(id: string, reason: string, waivedBy: string): Promise<Fine> {
    const res = await axiosClient.post(`${BASE}/${id}/waive`, { reason, waivedBy });
    return res.data.data;
  }

  /**
   * DELETE - Remove fine
   */
  async deleteFine(id: string): Promise<boolean> {
    await axiosClient.delete(`${BASE}/${id}`);
    return true;
  }

  /**
   * BULK DELETE - Remove multiple fines
   */
  async bulkDeleteFines(ids: string[]): Promise<number> {
    const res = await axiosClient.post(`${BASE}/bulk-delete`, { ids });
    return res.data.deletedCount ?? ids.length;
  }

  /**
   * SEARCH - Filter fines by query (client-side on fetched data)
   */
  async searchFines(query: string): Promise<Fine[]> {
    const fines = await this.getAllFines();
    const lowerQuery = query.toLowerCase();
    return fines.filter(
      (f) =>
        f.memberName?.toLowerCase().includes(lowerQuery) ||
        f.memberEmail?.toLowerCase().includes(lowerQuery) ||
        f.bookTitle?.toLowerCase().includes(lowerQuery) ||
        f.id?.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const finesService = new FineService();