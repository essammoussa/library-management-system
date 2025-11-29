import { Fine, FineStatus } from '@/types/Fine';
import finesData from '@/data/fines.json';

// This simulates API calls. Replace with real API later.
class FineService {
  private fines: Fine[] = [];
  private storageKey = 'library_fines';

  constructor() {
    this.loadFines();
  }

  /**
   * Load fines from localStorage or use mock data
   */
  private loadFines() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.fines = JSON.parse(stored);
    } else {
      this.fines = finesData as Fine[];
      this.saveFines();
    }
  }

  /**
   * Save fines to localStorage
   */
  private saveFines() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.fines));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    const maxId = this.fines.reduce((max, fine) => {
      const num = parseInt(fine.id.replace('F', ''));
      return num > max ? num : max;
    }, 0);
    return `F${String(maxId + 1).padStart(3, '0')}`;
  }

  /**
   * GET ALL - Fetch all fines
   */
  async getAllFines(): Promise<Fine[]> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/fines');
    // return response.json();
    
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.fines]), 500);
    });
  }

  /**
   * GET BY ID - Fetch single fine
   */
  async getFineById(id: string): Promise<Fine | null> {
    // TODO: const response = await fetch(`/api/fines/${id}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const fine = this.fines.find(f => f.id === id);
        resolve(fine || null);
      }, 300);
    });
  }

  /**
   * GET BY MEMBER - Fetch fines for a specific member
   */
  async getFinesByMember(memberId: string): Promise<Fine[]> {
    // TODO: const response = await fetch(`/api/fines/member/${memberId}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const memberFines = this.fines.filter(f => f.memberId === memberId);
        resolve(memberFines);
      }, 300);
    });
  }

  /**
   * CREATE - Add new fine
   */
  async createFine(fineData: Omit<Fine, 'id' | 'createdAt'>): Promise<Fine> {
    // TODO: const response = await fetch('/api/fines', {
    //   method: 'POST',
    //   body: JSON.stringify(fineData)
    // });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFine: Fine = {
          ...fineData,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
        };
        
        this.fines.push(newFine);
        this.saveFines();
        resolve(newFine);
      }, 500);
    });
  }

  /**
   * UPDATE - Update existing fine
   */
  async updateFine(id: string, updates: Partial<Fine>): Promise<Fine> {
    // TODO: const response = await fetch(`/api/fines/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(updates)
    // });
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.fines.findIndex(f => f.id === id);
        if (index === -1) {
          reject(new Error('Fine not found'));
          return;
        }

        this.fines[index] = { ...this.fines[index], ...updates };
        this.saveFines();
        resolve(this.fines[index]);
      }, 500);
    });
  }

  /**
   * MARK AS PAID - Special update for payment
   */
  async markAsPaid(id: string, notes?: string): Promise<Fine> {
    return this.updateFine(id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
      notes: notes || 'Payment received',
    });
  }

  /**
   * WAIVE FINE - Waive a fine with reason
   */
  async waiveFine(id: string, reason: string, waivedBy: string): Promise<Fine> {
    return this.updateFine(id, {
      status: 'waived',
      waivedAt: new Date().toISOString(),
      waivedBy,
      waiverReason: reason,
    });
  }

  /**
   * DELETE - Remove fine
   */
  async deleteFine(id: string): Promise<boolean> {
    // TODO: const response = await fetch(`/api/fines/${id}`, {
    //   method: 'DELETE'
    // });
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.fines.findIndex(f => f.id === id);
        if (index === -1) {
          reject(new Error('Fine not found'));
          return;
        }

        this.fines.splice(index, 1);
        this.saveFines();
        resolve(true);
      }, 500);
    });
  }

  /**
   * BULK DELETE - Remove multiple fines
   */
  async bulkDeleteFines(ids: string[]): Promise<number> {
    // TODO: const response = await fetch('/api/fines/bulk-delete', {
    //   method: 'POST',
    //   body: JSON.stringify({ ids })
    // });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const initialLength = this.fines.length;
        this.fines = this.fines.filter(f => !ids.includes(f.id));
        const deletedCount = initialLength - this.fines.length;
        this.saveFines();
        resolve(deletedCount);
      }, 500);
    });
  }

  /**
   * SEARCH - Filter fines by query
   */
  async searchFines(query: string): Promise<Fine[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const filtered = this.fines.filter(
          f =>
            f.memberName.toLowerCase().includes(lowerQuery) ||
            f.memberEmail.toLowerCase().includes(lowerQuery) ||
            f.bookTitle.toLowerCase().includes(lowerQuery) ||
            f.id.toLowerCase().includes(lowerQuery)
        );
        resolve(filtered);
      }, 300);
    });
  }
}

// Export singleton instance
export const finesService = new FineService();