import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index"; // import your store types

// Custom hook for dispatch with types
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for selector with RootState type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
