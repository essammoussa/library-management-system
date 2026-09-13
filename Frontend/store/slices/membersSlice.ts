import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { memberApi } from "@/api/memberApi";
import { Member } from "@/data/members";

// ------------------- STATE ------------------- //
interface MembersState {
  members: Member[];            // All members
  currentMember: Member | null; // Single member selected for detail/edit
  loading: boolean;             // Loading state for async actions
  error: string | null;         // Error messages
}

// Initial state
const initialState: MembersState = {
  members: [],
  currentMember: null,
  loading: false,
  error: null,
};

// ------------------- ASYNC THUNKS ------------------- //
// Fetch all members
export const fetchMembers = createAsyncThunk(
  "members/fetchAll",
  async () => await memberApi.getAll()
);

// Fetch single member by ID
export const fetchMemberById = createAsyncThunk(
  "members/fetchById",
  async (id: string) => await memberApi.getById(id)
);

// Search members by name/email/etc
export const searchMembers = createAsyncThunk(
  "members/search",
  async (query: string) => await memberApi.search(query)
);

// Fetch members by their status (active/inactive/suspended)
export const fetchMembersByStatus = createAsyncThunk(
  "members/fetchByStatus",
  async (status: Member["status"]) => await memberApi.getByStatus(status)
);

// Fetch only active members
export const fetchActiveMembers = createAsyncThunk(
  "members/fetchActive",
  async () => await memberApi.getActive()
);

// Create a new member
export const createMember = createAsyncThunk(
  "members/create",
  async (memberData: Omit<Member, "id">) => await memberApi.create(memberData)
);

// Update an existing member
export const updateMember = createAsyncThunk(
  "members/update",
  async ({ id, data }: { id: string; data: Partial<Member> }) =>
    await memberApi.update(id, data)
);

// Delete a member
export const deleteMember = createAsyncThunk(
  "members/delete",
  async (id: string) => {
    await memberApi.delete(id);
    return id;
  }
);

// Suspend a member
export const suspendMember = createAsyncThunk(
  "members/suspend",
  async (id: string) => await memberApi.suspend(id)
);

// Activate a suspended member
export const activateMember = createAsyncThunk(
  "members/activate",
  async (id: string) => await memberApi.activate(id)
);

// Fetch stats related to a member (borrow counts, fines, etc.)
export const fetchMemberStats = createAsyncThunk(
  "members/fetchStats",
  async (id: string) => await memberApi.getStats(id)
);

// ------------------- SLICE ------------------- //
const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null; // Reset error
    },
    clearCurrentMember: (state) => {
      state.currentMember = null; // Reset selected member
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch all members ---
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch members";
      })

      // --- Fetch member by ID ---
      .addCase(fetchMemberById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch member";
      })

      // --- Search members ---
      .addCase(searchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(searchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search members";
      })

      // --- Fetch by status ---
      .addCase(fetchMembersByStatus.fulfilled, (state, action) => {
        state.members = action.payload;
      })

      // --- Fetch active members ---
      .addCase(fetchActiveMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })

      // --- Create member ---
      .addCase(createMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(createMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create member";
      })

      // --- Update member ---
      .addCase(updateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.members.findIndex((m) => m.id === action.payload!.id);
          if (index !== -1) state.members[index] = action.payload;
          if (state.currentMember?.id === action.payload.id) state.currentMember = action.payload;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update member";
      })

      // --- Delete member ---
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete member";
      })

      // --- Suspend member ---
      .addCase(suspendMember.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.members.findIndex((m) => m.id === action.payload!.id);
          if (index !== -1) state.members[index] = action.payload;
        }
      })

      // --- Activate member ---
      .addCase(activateMember.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.members.findIndex((m) => m.id === action.payload!.id);
          if (index !== -1) state.members[index] = action.payload;
        }
      });
  },
});

// Export actions
export const { clearError, clearCurrentMember } = membersSlice.actions;

// Export reducer
export default membersSlice.reducer;
