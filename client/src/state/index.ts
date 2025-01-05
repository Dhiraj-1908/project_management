import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "./api";  // Import User type from your API file

export interface initialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  // Add auth-related state
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: initialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  // Add auth-related initial state
  token: null,
  user: null,
  isAuthenticated: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    // Add auth-related reducers
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { 
  setIsSidebarCollapsed, 
  setIsDarkMode,
  setCredentials,
  logout 
} = globalSlice.actions;

export default globalSlice.reducer;