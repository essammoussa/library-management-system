import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { memberApi } from "@/api/memberApi";
import { Member } from "@/data/members";

interface MembersState {
  members: Member[];
  currentMember: Member | null;
  loading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  members: [],
  currentMember: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMembers = createAsyncThunk("members/fetchAll", async () => {
  return await memberApi.getAll();
});

export const fetchMemberById = createAsyncThunk(
  "members/fetchById",
  async (id: string) => {
    return await memberApi.getById(id);
  }
);

export const searchMembers = createAsyncThunk(
  "members/search",
  async (query: string) => {
    return await memberApi.search(query);
  }
);

export const fetchMembersByStatus = createAsyncThunk(
  "members/fetchByStatus",
  async (status: Member["status"]) => {
    return await memberApi.getByStatus(status);
  }
);

export const fetchActiveMembers = createAsyncThunk(
  "members/fetchActive",
  async () => {
    return await memberApi.getActive();
  }
);

export const createMember = createAsyncThunk(
  "members/create",
  async (memberData: Omit<Member, "id">) => {
    return await memberApi.create(memberData);
  }
);

export const updateMember = createAsyncThunk(
  "members/update",
  async ({ id, data }: { id: string; data: Partial<Member> }) => {
    return await memberApi.update(id, data);
  }
);

export const deleteMember = createAsyncThunk(
  "members/delete",
  async (id: string) => {
    await memberApi.delete(id);
    return id;
  }
);

export const suspendMember = createAsyncThunk(
  "members/suspend",
  async (id: string) => {
    return await memberApi.suspend(id);
  }
);

export const activateMember = createAsyncThunk(
  "members/activate",
  async (id: string) => {
    return await memberApi.activate(id);
  }
);

export const fetchMemberStats = createAsyncThunk(
  "members/fetchStats",
  async (id: string) => {
    return await memberApi.getStats(id);
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all members
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
      // Fetch member by ID
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
      // Search members
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
      // Fetch by status
      .addCase(fetchMembersByStatus.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      // Fetch active
      .addCase(fetchActiveMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      // Create member
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
      // Update member
      .addCase(updateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.members.findIndex((m) => m.id === action.payload!.id);
          if (index !== -1) {
            state.members[index] = action.payload;
          }
          if (state.currentMember?.id === action.payload.id) {
            state.currentMember = action.payload;
          }
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update member";
      })
      // Delete member
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
      // Suspend member
      .addCase(suspendMember.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.members.findIndex((m) => m.id === action.payload!.id);
          if (index !== -1) {
            state.members[index] = action.payload;
          }
        }
      })
      // Activate member
      .addCase(activateMember.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.members.findIndex((m) => m.id === action.payload!.id);
          if (index !== -1) {
            state.members[index] = action.payload;
          }
        }
      });
  },
});

export const { clearError, clearCurrentMember } = membersSlice.actions;
export default membersSlice.reducer;
