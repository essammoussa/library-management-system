import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { borrowApi } from "@/api/borrowApi";
import { BorrowRecord } from "@/data/borrowing";

interface BorrowState {
  records: BorrowRecord[];
  currentRecord: BorrowRecord | null;
  stats: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: BorrowState = {
  records: [],
  currentRecord: null,
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchBorrowRecords = createAsyncThunk(
  "borrow/fetchAll",
  async () => {
    return await borrowApi.getAll();
  }
);

export const fetchBorrowRecordById = createAsyncThunk(
  "borrow/fetchById",
  async (id: string) => {
    return await borrowApi.getById(id);
  }
);

export const fetchActiveBorrowRecords = createAsyncThunk(
  "borrow/fetchActive",
  async () => {
    return await borrowApi.getActive();
  }
);

export const fetchOverdueBorrowRecords = createAsyncThunk(
  "borrow/fetchOverdue",
  async () => {
    return await borrowApi.getOverdue();
  }
);

export const fetchBorrowRecordsByMember = createAsyncThunk(
  "borrow/fetchByMember",
  async (memberId: string) => {
    return await borrowApi.getByMember(memberId);
  }
);

export const fetchBorrowRecordsByBook = createAsyncThunk(
  "borrow/fetchByBook",
  async (bookId: string) => {
    return await borrowApi.getByBook(bookId);
  }
);

export const createBorrowRecord = createAsyncThunk(
  "borrow/create",
  async (
    recordData: Omit<BorrowRecord, "id" | "returnDate" | "fine">
  ) => {
    return await borrowApi.create(recordData);
  }
);

export const updateBorrowRecord = createAsyncThunk(
  "borrow/update",
  async ({ id, data }: { id: string; data: Partial<BorrowRecord> }) => {
    return await borrowApi.update(id, data);
  }
);

export const returnBook = createAsyncThunk(
  "borrow/returnBook",
  async ({ id, returnDate }: { id: string; returnDate: string }) => {
    return await borrowApi.returnBook(id, returnDate);
  }
);

export const deleteBorrowRecord = createAsyncThunk(
  "borrow/delete",
  async (id: string) => {
    await borrowApi.delete(id);
    return id;
  }
);

export const renewBorrowRecord = createAsyncThunk(
  "borrow/renew",
  async ({ id, newDueDate }: { id: string; newDueDate: string }) => {
    return await borrowApi.renew(id, newDueDate);
  }
);

export const fetchBorrowStats = createAsyncThunk(
  "borrow/fetchStats",
  async () => {
    return await borrowApi.getStats();
  }
);

const borrowSlice = createSlice({
  name: "borrow",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all records
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
      // Fetch by ID
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
      // Fetch active
      .addCase(fetchActiveBorrowRecords.fulfilled, (state, action) => {
        state.records = action.payload;
      })
      // Fetch overdue
      .addCase(fetchOverdueBorrowRecords.fulfilled, (state, action) => {
        state.records = action.payload;
      })
      // Fetch by member
      .addCase(fetchBorrowRecordsByMember.fulfilled, (state, action) => {
        state.records = action.payload;
      })
      // Fetch by book
      .addCase(fetchBorrowRecordsByBook.fulfilled, (state, action) => {
        state.records = action.payload;
      })
      // Create record
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
      // Update record
      .addCase(updateBorrowRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBorrowRecord.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.records.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) {
            state.records[index] = action.payload;
          }
          if (state.currentRecord?.id === action.payload.id) {
            state.currentRecord = action.payload;
          }
        }
      })
      .addCase(updateBorrowRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update borrow record";
      })
      // Return book
      .addCase(returnBook.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.records.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) {
            state.records[index] = action.payload;
          }
        }
      })
      // Delete record
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
      // Renew record
      .addCase(renewBorrowRecord.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.records.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) {
            state.records[index] = action.payload;
          }
        }
      })
      // Fetch stats
      .addCase(fetchBorrowStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearCurrentRecord } = borrowSlice.actions;
export default borrowSlice.reducer;
