import { configureStore } from "@reduxjs/toolkit"; // Import Redux Toolkit function to create the store

// Import all your slice reducers
import authReducer from "./slices/authSlice";
import booksReducer from "./slices/booksSlice";
import membersReducer from "./slices/membersSlice";
import borrowReducer from "./slices/borrowSlice";
import reservationsReducer from "./slices/reservationsSlice";

// Create the Redux store
export const store = configureStore({
  reducer: {
    // Each slice reducer manages its own part of the state
    auth: authReducer,              // Handles authentication state (user login/logout)
    books: booksReducer,            // Handles books data (list, details, categories)
    members: membersReducer,        // Handles members data (list, current member, stats)
    borrow: borrowReducer,          // Handles borrow records (active, overdue, stats)
    reservations: reservationsReducer, // Handles reservations (active, fulfilled, stats)
  },
});

// Define TypeScript types for better type safety

// RootState represents the entire state tree of the store
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch represents the type of dispatch function for this store
export type AppDispatch = typeof store.dispatch;
