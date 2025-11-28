import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "librarian" | "member";
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Mock auth API calls
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Mock successful login
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

export const logout = createAsyncThunk("auth/logout", async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return null;
});

export const register = createAsyncThunk(
  "auth/register",
  async (userData: { name: string; email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      user: {
        id: String(Date.now()),
        name: userData.name,
        email: userData.email,
        role: "member" as const,
      },
      token: "mock-jwt-token",
    };
  }
);

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
      // Login
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
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      // Register
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

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
