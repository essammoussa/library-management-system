import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// --------------------
// Types
// --------------------
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "librarian" | "member";
}

interface AuthState {
  user: User | null;      // Logged-in user info
  token: string | null;   // JWT token (mocked here)
  loading: boolean;       // Loading state for async actions
  error: string | null;   // Error message if any
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// --------------------
// Async Thunks
// --------------------

// Mock login API
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay
    // Return mocked user + token
    return {
      user: {
        id: "1",
        name: "Admin User",
        email,
        role: "admin" as const,
      },
      token: "mock-jwt-token",
    };
  }
);

// Mock logout API
export const logout = createAsyncThunk("auth/logout", async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return null; // No payload needed for logout
});

// Mock registration API
export const register = createAsyncThunk(
  "auth/register",
  async (userData: { name: string; email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      user: {
        id: String(Date.now()), // mock unique ID
        name: userData.name,
        email: userData.email,
        role: "member" as const,
      },
      token: "mock-jwt-token",
    };
  }
);

// --------------------
// Slice
// --------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Clear any error message
    clearError: (state) => {
      state.error = null;
    },
    // Directly set the user (useful for restoring from localStorage)
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
        state.error = action.error.message || "Login failed";
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
        state.error = action.error.message || "Registration failed";
      });
  },
});

// Export actions and reducer
export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
