import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/lib/axiosClient";

// --------------------
// Types
// --------------------
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "librarian" | "member";
  membershipId?: string;
  phone?: string;
  address?: string;
  status?: string;
  borrowedBooks?: number;
  joinDate?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Restore from localStorage
const storedToken = localStorage.getItem("authToken");
const storedUser = localStorage.getItem("authUser");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
};

// --------------------
// Async Thunks
// --------------------

// Real login API
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      const { token, user } = res.data;
      // Persist to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      return { user, token };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  return null;
});

// Real registration API
export const register = createAsyncThunk(
  "auth/register",
  async (
    userData: { name: string; email: string; password: string; phone?: string; address?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosClient.post("/auth/register", userData);
      const { token, user } = res.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      return { user, token };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

// --------------------
// Slice
// --------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // -------- LOGIN --------
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Login failed";
      })

      // -------- LOGOUT --------
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })

      // -------- REGISTER --------
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || "Registration failed";
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
