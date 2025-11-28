import { Fine } from '@/types/Fine';

export const finesMock: Fine[] = [
  { id: "1", bookId: "2", bookTitle: "To Kill a Mockingbird", memberId: "1", memberName: "Alice Johnson", borrowDate: "2024-01-15", dueDate: "2024-02-15", returnDate: null, status: "active", fine: 0 },
  { id: "2", bookId: "1", bookTitle: "The Great Gatsby", memberId: "2", memberName: "Bob Smith", borrowDate: "2024-01-10", dueDate: "2024-02-10", returnDate: "2024-02-08", status: "returned", fine: 0 },
  { id: "3", bookId: "3", bookTitle: "1984", memberId: "5", memberName: "Emma Davis", borrowDate: "2024-01-05", dueDate: "2024-02-05", returnDate: null, status: "overdue", fine: 5.5 },
  { id: "4", bookId: "5", bookTitle: "The Catcher in the Rye", memberId: "1", memberName: "Alice Johnson", borrowDate: "2024-01-20", dueDate: "2024-02-20", returnDate: null, status: "active", fine: 0 },
  { id: "5", bookId: "1", bookTitle: "The Great Gatsby", memberId: "5", memberName: "Emma Davis", borrowDate: "2024-01-18", dueDate: "2024-02-18", returnDate: null, status: "active", fine: 0 },
  { id: "6", bookId: "7", bookTitle: "The Hobbit", memberId: "6", memberName: "Frank Martinez", borrowDate: "2024-01-22", dueDate: "2024-02-22", returnDate: null, status: "active", fine: 0 },
  { id: "7", bookId: "7", bookTitle: "The Hobbit", memberId: "7", memberName: "Grace Taylor", borrowDate: "2024-01-25", dueDate: "2024-02-25", returnDate: null, status: "active", fine: 0 },
  { id: "8", bookId: "13", bookTitle: "The Alchemist", memberId: "9", memberName: "Isabel Garcia", borrowDate: "2024-01-12", dueDate: "2024-02-12", returnDate: null, status: "active", fine: 0 },
  { id: "9", bookId: "8", bookTitle: "Harry Potter and the Philosopher's Stone", memberId: "11", memberName: "Karen Lee", borrowDate: "2024-01-08", dueDate: "2024-02-08", returnDate: "2024-02-07", status: "returned", fine: 0 },
  { id: "10", bookId: "7", bookTitle: "The Hobbit", memberId: "12", memberName: "Leo Thompson", borrowDate: "2024-01-28", dueDate: "2024-02-28", returnDate: null, status: "active", fine: 0 },
  { id: "11", bookId: "13", bookTitle: "The Alchemist", memberId: "5", memberName: "Emma Davis", borrowDate: "2023-12-20", dueDate: "2024-01-20", returnDate: "2024-01-18", status: "returned", fine: 0 },
  { id: "12", bookId: "8", bookTitle: "Harry Potter and the Philosopher's Stone", memberId: "7", memberName: "Grace Taylor", borrowDate: "2024-01-16", dueDate: "2024-02-16", returnDate: null, status: "active", fine: 0 },
  { id: "13", bookId: "13", bookTitle: "The Alchemist", memberId: "11", memberName: "Karen Lee", borrowDate: "2023-12-15", dueDate: "2024-01-15", returnDate: null, status: "overdue", fine: 3.0 }
];
