import borrowingData from "./borrowing.json";

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: "active" | "returned" | "overdue";
  fine: number;
}

export const mockBorrowRecords: BorrowRecord[] = borrowingData as BorrowRecord[];
