import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import booksReducer from "./slices/booksSlice";
import membersReducer from "./slices/membersSlice";
import borrowReducer from "./slices/borrowSlice";
import reservationsReducer from "./slices/reservationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: booksReducer,
    members: membersReducer,
    borrow: borrowReducer,
    reservations: reservationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
