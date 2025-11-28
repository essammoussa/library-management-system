import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reservationApi } from "@/api/reservationApi";
import { Reservation } from "@/data/reservations";

interface ReservationsState {
  reservations: Reservation[];
  currentReservation: Reservation | null;
  stats: {
    total: number;
    active: number;
    fulfilled: number;
    expired: number;
    cancelled: number;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReservationsState = {
  reservations: [],
  currentReservation: null,
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchReservations = createAsyncThunk(
  "reservations/fetchAll",
  async () => {
    return await reservationApi.getAll();
  }
);

export const fetchReservationById = createAsyncThunk(
  "reservations/fetchById",
  async (id: string) => {
    return await reservationApi.getById(id);
  }
);

export const fetchActiveReservations = createAsyncThunk(
  "reservations/fetchActive",
  async () => {
    return await reservationApi.getActive();
  }
);

export const fetchReservationsByMember = createAsyncThunk(
  "reservations/fetchByMember",
  async (memberId: string) => {
    return await reservationApi.getByMember(memberId);
  }
);

export const fetchReservationsByBook = createAsyncThunk(
  "reservations/fetchByBook",
  async (bookId: string) => {
    return await reservationApi.getByBook(bookId);
  }
);

export const fetchReservationsByStatus = createAsyncThunk(
  "reservations/fetchByStatus",
  async (status: Reservation["status"]) => {
    return await reservationApi.getByStatus(status);
  }
);

export const createReservation = createAsyncThunk(
  "reservations/create",
  async (reservationData: Omit<Reservation, "id" | "priority">) => {
    return await reservationApi.create(reservationData);
  }
);

export const updateReservation = createAsyncThunk(
  "reservations/update",
  async ({ id, data }: { id: string; data: Partial<Reservation> }) => {
    return await reservationApi.update(id, data);
  }
);

export const cancelReservation = createAsyncThunk(
  "reservations/cancel",
  async (id: string) => {
    return await reservationApi.cancel(id);
  }
);

export const fulfillReservation = createAsyncThunk(
  "reservations/fulfill",
  async (id: string) => {
    return await reservationApi.fulfill(id);
  }
);

export const deleteReservation = createAsyncThunk(
  "reservations/delete",
  async (id: string) => {
    await reservationApi.delete(id);
    return id;
  }
);

export const fetchNextInQueue = createAsyncThunk(
  "reservations/fetchNextInQueue",
  async (bookId: string) => {
    return await reservationApi.getNextInQueue(bookId);
  }
);

export const fetchReservationStats = createAsyncThunk(
  "reservations/fetchStats",
  async () => {
    return await reservationApi.getStats();
  }
);

const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reservations";
      })
      // Fetch by ID
      .addCase(fetchReservationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReservation = action.payload;
      })
      .addCase(fetchReservationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reservation";
      })
      // Fetch active
      .addCase(fetchActiveReservations.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })
      // Fetch by member
      .addCase(fetchReservationsByMember.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })
      // Fetch by book
      .addCase(fetchReservationsByBook.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })
      // Fetch by status
      .addCase(fetchReservationsByStatus.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create reservation";
      })
      // Update reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.reservations.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) {
            state.reservations[index] = action.payload;
          }
          if (state.currentReservation?.id === action.payload.id) {
            state.currentReservation = action.payload;
          }
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update reservation";
      })
      // Cancel reservation
      .addCase(cancelReservation.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.reservations.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) {
            state.reservations[index] = action.payload;
          }
        }
      })
      // Fulfill reservation
      .addCase(fulfillReservation.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.reservations.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) {
            state.reservations[index] = action.payload;
          }
        }
      })
      // Delete reservation
      .addCase(deleteReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = state.reservations.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete reservation";
      })
      // Fetch stats
      .addCase(fetchReservationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearCurrentReservation } = reservationsSlice.actions;
export default reservationsSlice.reducer;
