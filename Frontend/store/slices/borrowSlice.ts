import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { borrowApi } from "@/api/borrowApi";
import { BorrowRecord } from "@/data/borrowing";

// Define the state structure for borrowing records
interface BorrowState {
  records: BorrowRecord[];        // All borrow records
  currentRecord: BorrowRecord | null; // Single record selected for detail/edit
  stats: {                        // Borrowing statistics
    total: number;
    active: number;
    overdue: number;
    returned: number;
  } | null;
  loading: boolean;               // Loading state for async actions
  error: string | null;           // Error messages
}

// Initial state
const initialState: BorrowState = {
  records: [],
  currentRecord: null,
  stats: null,
  loading: false,
  error: null,
};

// ------------------- ASYNC THUNKS ------------------- //
// Fetch all borrow records
export const fetchBorrowRecords = createAsyncThunk(
  "borrow/fetchAll",
  async () => await borrowApi.getAll()
);

// Fetch single borrow record by ID
export const fetchBorrowRecordById = createAsyncThunk(
  "borrow/fetchById",
  async (id: string) => await borrowApi.getById(id)
);

// Fetch active borrow records
export const fetchActiveBorrowRecords = createAsyncThunk(
  "borrow/fetchActive",
  async () => await borrowApi.getActive()
);

// Fetch overdue borrow records
export const fetchOverdueBorrowRecords = createAsyncThunk(
  "borrow/fetchOverdue",
  async () => await borrowApi.getOverdue()
);

// Fetch borrow records by member
export const fetchBorrowRecordsByMember = createAsyncThunk(
  "borrow/fetchByMember",
  async (memberId: string) => await borrowApi.getByMember(memberId)
);

// Fetch borrow records by book
export const fetchBorrowRecordsByBook = createAsyncThunk(
  "borrow/fetchByBook",
  async (bookId: string) => await borrowApi.getByBook(bookId)
);

// Create a new borrow record
export const createBorrowRecord = createAsyncThunk(
  "borrow/create",
  async (recordData: Omit<BorrowRecord, "id" | "returnDate" | "fine">) =>
    await borrowApi.create(recordData)
);

// Update an existing borrow record
export const updateBorrowRecord = createAsyncThunk(
  "borrow/update",
  async ({ id, data }: { id: string; data: Partial<BorrowRecord> }) =>
    await borrowApi.update(id, data)
);

// Mark a borrow record as returned
export const returnBook = createAsyncThunk(
  "borrow/returnBook",
  async ({ id, returnDate }: { id: string; returnDate: string }) =>
    await borrowApi.returnBook(id, returnDate)
);

// Delete a borrow record
export const deleteBorrowRecord = createAsyncThunk(
  "borrow/delete",
  async (id: string) => {
    await borrowApi.delete(id);
    return id;
  }
);

// Renew a borrow record (extend due date)
export const renewBorrowRecord = createAsyncThunk(
  "borrow/renew",
  async ({ id, newDueDate }: { id: string; newDueDate: string }) =>
    await borrowApi.renew(id, newDueDate)
);

// Fetch borrowing statistics
export const fetchBorrowStats = createAsyncThunk(
  "borrow/fetchStats",
  async () => await borrowApi.getStats()
);

// ------------------- SLICE ------------------- //
const borrowSlice = createSlice({
  name: "borrow",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Reset error
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null; // Reset selected record
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch all records ---
      .addCase(fetchBorrowRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchBorrowRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch borrow records";
      })

      // --- Fetch by ID ---
      .addCase(fetchBorrowRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(fetchBorrowRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch borrow record";
      })

      // --- Fetch active ---
      .addCase(fetchActiveBorrowRecords.fulfilled, (state, action) => {
        state.records = action.payload;
      })

      // --- Fetch overdue ---
      .addCase(fetchOverdueBorrowRecords.fulfilled, (state, action) => {
        state.records = action.payload;
      })

      // --- Fetch by member ---
      .addCase(fetchBorrowRecordsByMember.fulfilled, (state, action) => {
        state.records = action.payload;
      })

      // --- Fetch by book ---
      .addCase(fetchBorrowRecordsByBook.fulfilled, (state, action) => {
        state.records = action.payload;
      })

      // --- Create record ---
      .addCase(createBorrowRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBorrowRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.push(action.payload);
      })
      .addCase(createBorrowRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create borrow record";
      })

      // --- Update record ---
      .addCase(updateBorrowRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBorrowRecord.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.records.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) state.records[index] = action.payload;
          if (state.currentRecord?.id === action.payload.id) state.currentRecord = action.payload;
        }
      })
      .addCase(updateBorrowRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update borrow record";
      })

      // --- Return book ---
      .addCase(returnBook.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.records.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) state.records[index] = action.payload;
        }
      })

      // --- Delete record ---
      .addCase(deleteBorrowRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBorrowRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteBorrowRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete borrow record";
      })

      // --- Renew record ---
      .addCase(renewBorrowRecord.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.records.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) state.records[index] = action.payload;
        }
      })

      // --- Fetch stats ---
      .addCase(fetchBorrowStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

// Export actions
export const { clearError, clearCurrentRecord } = borrowSlice.actions;

// Export reducer
export default borrowSlice.reducer;
