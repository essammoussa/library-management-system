import { Fine, FineStatus } from '@/types/Fine';

// Configuration (can be moved to env or config file)
export const FINE_CONFIG = {
  DAILY_RATE: 1.0, // $1 per day
  MAX_FINE: 50.0, // Maximum fine cap
  GRACE_PERIOD_DAYS: 0, // No grace period
};

export class FineCalculator {
  /**
   * Calculate days overdue
   */
  static calculateDaysOverdue(dueDate: string, returnDate?: string): number {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    const diffTime = returned.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays - FINE_CONFIG.GRACE_PERIOD_DAYS);
  }

  /**
   * Calculate fine amount based on days overdue
   */
static calculateFineAmount(daysOverdue: number): number {
    const amount = daysOverdue * FINE_CONFIG.DAILY_RATE; 
    return Math.min(amount, FINE_CONFIG.MAX_FINE);
}
  /**
   * Calculate fine from borrow details
   */
  static calculateFine(dueDate: string, returnDate?: string): {
    daysOverdue: number;
    fineAmount: number;
  } {
    const daysOverdue = this.calculateDaysOverdue(dueDate, returnDate);
    const fineAmount = this.calculateFineAmount(daysOverdue);
    return { daysOverdue, fineAmount };
  }

  /**
   * Check if a borrow is overdue
   */
  static isOverdue(dueDate: string): boolean {
    const due = new Date(dueDate);
    const now = new Date();
    return now > due;
  }

  /**
   * Get status badge styling
   */
  static getStatusColor(status: FineStatus): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'waived':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Format date
   */
  static formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  }

  /**
   * Calculate statistics from fines array
   */
  static calculateStatistics(fines: Fine[]) {
    return {
      totalFines: fines.length,
      totalPending: fines.filter(f => f.status === 'pending').length,
      totalPaid: fines.filter(f => f.status === 'paid').length,
      totalWaived: fines.filter(f => f.status === 'waived').length,
      totalOverdue: fines.filter(f => f.status === 'overdue').length,
      pendingAmount: fines
        .filter(f => f.status === 'pending' || f.status === 'overdue')
        .reduce((sum, f) => sum + f.fineAmount, 0),
      paidAmount: fines
        .filter(f => f.status === 'paid')
        .reduce((sum, f) => sum + f.fineAmount, 0),
      waivedAmount: fines
        .filter(f => f.status === 'waived')
        .reduce((sum, f) => sum + f.fineAmount, 0),
    };
  }
}