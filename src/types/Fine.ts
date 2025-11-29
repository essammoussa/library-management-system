export type FineStatus = 'pending' | 'paid' | 'waived' | 'overdue';

export interface Fine {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  daysOverdue: number;
  fineAmount: number;
  status: FineStatus;
  createdAt: string;
  paidAt?: string;
  waivedAt?: string;
  waivedBy?: string;
  waiverReason?: string;
  notes?: string;
}

export interface FineStatistics {
  totalFines: number;
  totalPending: number;
  totalPaid: number;
  totalWaived: number;
  totalOverdue: number;
  pendingAmount: number;
  paidAmount: number;
  waivedAmount: number;
}

export interface FineFilters {
  status: FineStatus | 'all';
  searchQuery: string;
  dateFrom?: string;
  dateTo?: string;
}