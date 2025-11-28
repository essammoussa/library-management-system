import { mockBorrowRecords, BorrowRecord } from "@/data/borrowing";

// Simulate network delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory store
let borrowStore = [...mockBorrowRecords];

export const borrowApi = {
  // Get all borrow records
  getAll: async (): Promise<BorrowRecord[]> => {
    await delay();
    return [...borrowStore];
  },

  // Get borrow record by ID
  getById: async (id: string): Promise<BorrowRecord | null> => {
    await delay();
    const record = borrowStore.find((r) => r.id === id);
    return record ? { ...record } : null;
  },

  // Get active borrows
  getActive: async (): Promise<BorrowRecord[]> => {
    await delay();
    return borrowStore.filter((record) => record.status === "active");
  },

  // Get overdue borrows
  getOverdue: async (): Promise<BorrowRecord[]> => {
    await delay();
    return borrowStore.filter((record) => record.status === "overdue");
  },

  // Get by member
  getByMember: async (memberId: string): Promise<BorrowRecord[]> => {
    await delay();
    return borrowStore.filter((record) => record.memberId === memberId);
  },

  // Get by book
  getByBook: async (bookId: string): Promise<BorrowRecord[]> => {
    await delay();
    return borrowStore.filter((record) => record.bookId === bookId);
  },

  // Create borrow record (checkout)
  create: async (
    borrowData: Omit<BorrowRecord, "id" | "returnDate" | "fine">
  ): Promise<BorrowRecord> => {
    await delay();
    const newRecord: BorrowRecord = {
      ...borrowData,
      id: String(Date.now()),
      returnDate: null,
      fine: 0,
    };
    borrowStore.push(newRecord);
    return { ...newRecord };
  },

  // Update borrow record
  update: async (id: string, data: Partial<BorrowRecord>): Promise<BorrowRecord | null> => {
    await delay();
    const index = borrowStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    borrowStore[index] = { ...borrowStore[index], ...data };
    return { ...borrowStore[index] };
  },

  // Return book
  returnBook: async (id: string, returnDate: string): Promise<BorrowRecord | null> => {
    await delay();
    const index = borrowStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    borrowStore[index].returnDate = returnDate;
    borrowStore[index].status = "returned";

    // Calculate fine if overdue
    const dueDate = new Date(borrowStore[index].dueDate);
    const actualReturn = new Date(returnDate);
    if (actualReturn > dueDate) {
      const daysOverdue = Math.ceil(
        (actualReturn.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      borrowStore[index].fine = daysOverdue * 0.5; // $0.50 per day
    }

    return { ...borrowStore[index] };
  },

  // Delete borrow record
  delete: async (id: string): Promise<boolean> => {
    await delay();
    const initialLength = borrowStore.length;
    borrowStore = borrowStore.filter((r) => r.id !== id);
    return borrowStore.length < initialLength;
  },

  // Renew borrow
  renew: async (id: string, newDueDate: string): Promise<BorrowRecord | null> => {
    await delay();
    const index = borrowStore.findIndex((r) => r.id === id);
    if (index === -1) return null;

    borrowStore[index].dueDate = newDueDate;
    return { ...borrowStore[index] };
  },

  // Get statistics
  getStats: async (): Promise<{
    total: number;
    active: number;
    overdue: number;
    returned: number;
  }> => {
    await delay();
    return {
      total: borrowStore.length,
      active: borrowStore.filter((r) => r.status === "active").length,
      overdue: borrowStore.filter((r) => r.status === "overdue").length,
      returned: borrowStore.filter((r) => r.status === "returned").length,
    };
  },
};
