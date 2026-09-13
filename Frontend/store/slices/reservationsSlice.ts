import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reservationApi } from "@/api/reservationApi";
import { Reservation } from "@/data/reservations";

// ------------------- STATE ------------------- //
interface ReservationsState {
  reservations: Reservation[];           // All reservations
  currentReservation: Reservation | null;// Selected reservation
  stats: {                               // Stats summary
    total: number;
    active: number;
    fulfilled: number;
    expired: number;
    cancelled: number;
  } | null;
  loading: boolean;                      // Loading state for async actions
  error: string | null;                  // Error messages
}

// Initial state
const initialState: ReservationsState = {
  reservations: [],
  currentReservation: null,
  stats: null,
  loading: false,
  error: null,
};

// ------------------- ASYNC THUNKS ------------------- //
// Fetch all reservations
export const fetchReservations = createAsyncThunk(
  "reservations/fetchAll",
  async () => await reservationApi.getAll()
);

// Fetch reservation by ID
export const fetchReservationById = createAsyncThunk(
  "reservations/fetchById",
  async (id: string) => await reservationApi.getById(id)
);

// Fetch active reservations only
export const fetchActiveReservations = createAsyncThunk(
  "reservations/fetchActive",
  async () => await reservationApi.getActive()
);

// Fetch reservations for a specific member
export const fetchReservationsByMember = createAsyncThunk(
  "reservations/fetchByMember",
  async (memberId: string) => await reservationApi.getByMember(memberId)
);

// Fetch reservations for a specific book
export const fetchReservationsByBook = createAsyncThunk(
  "reservations/fetchByBook",
  async (bookId: string) => await reservationApi.getByBook(bookId)
);

// Fetch reservations filtered by status
export const fetchReservationsByStatus = createAsyncThunk(
  "reservations/fetchByStatus",
  async (status: Reservation["status"]) => await reservationApi.getByStatus(status)
);

// Create a new reservation
export const createReservation = createAsyncThunk(
  "reservations/create",
  async (reservationData: Omit<Reservation, "id" | "priority">) =>
    await reservationApi.create(reservationData)
);

// Update an existing reservation
export const updateReservation = createAsyncThunk(
  "reservations/update",
  async ({ id, data }: { id: string; data: Partial<Reservation> }) =>
    await reservationApi.update(id, data)
);

// Cancel a reservation
export const cancelReservation = createAsyncThunk(
  "reservations/cancel",
  async (id: string) => await reservationApi.cancel(id)
);

// Fulfill a reservation
export const fulfillReservation = createAsyncThunk(
  "reservations/fulfill",
  async (id: string) => await reservationApi.fulfill(id)
);

// Delete a reservation
export const deleteReservation = createAsyncThunk(
  "reservations/delete",
  async (id: string) => {
    await reservationApi.delete(id);
    return id;
  }
);

// Fetch next member in queue for a specific book
export const fetchNextInQueue = createAsyncThunk(
  "reservations/fetchNextInQueue",
  async (bookId: string) => await reservationApi.getNextInQueue(bookId)
);

// Fetch reservation stats
export const fetchReservationStats = createAsyncThunk(
  "reservations/fetchStats",
  async () => await reservationApi.getStats()
);

// ------------------- SLICE ------------------- //
const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Reset error
    },
    clearCurrentReservation: (state) => {
      state.currentReservation = null; // Reset selected reservation
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch all reservations ---
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

      // --- Fetch reservation by ID ---
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

      // --- Fetch active reservations ---
      .addCase(fetchActiveReservations.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })

      // --- Fetch by member ---
      .addCase(fetchReservationsByMember.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })

      // --- Fetch by book ---
      .addCase(fetchReservationsByBook.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })

      // --- Fetch by status ---
      .addCase(fetchReservationsByStatus.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })

      // --- Create reservation ---
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

      // --- Update reservation ---
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.reservations.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) state.reservations[index] = action.payload;
          if (state.currentReservation?.id === action.payload.id)
            state.currentReservation = action.payload;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update reservation";
      })

      // --- Cancel reservation ---
      .addCase(cancelReservation.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.reservations.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) state.reservations[index] = action.payload;
        }
      })

      // --- Fulfill reservation ---
      .addCase(fulfillReservation.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.reservations.findIndex((r) => r.id === action.payload!.id);
          if (index !== -1) state.reservations[index] = action.payload;
        }
      })

      // --- Delete reservation ---
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

      // --- Fetch stats ---
      .addCase(fetchReservationStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

// Export actions
export const { clearError, clearCurrentReservation } = reservationsSlice.actions;

// Export reducer
export default reservationsSlice.reducer;
