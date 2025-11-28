export interface Fine {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'overdue' | 'returned';
  fine: number;
}
