import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchSession, loginRequest, logoutRequest } from "@/api/auth-api";
import { ApiError } from "@/api/api-client";
import type { LoginFormValues } from "@/schemas/login-schema";
import type { UserRole } from "@/types/api";
import type { RequestStatus } from "@/types/common";

interface AuthState {
  role: UserRole | null;
  status: RequestStatus;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  role: null,
  status: "idle",
  initialized: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (values: LoginFormValues, { rejectWithValue }) => {
    try {
      return await loginRequest(values.email, values.password);
    } catch (e) {
      return rejectWithValue(e instanceof ApiError ? e.message : "generic");
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutRequest().catch(() => undefined);
});

export const restoreSession = createAsyncThunk("auth/restore", async (_, { rejectWithValue }) => {
  try {
    return await fetchSession();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      return rejectWithValue("unauthenticated");
    }
    return rejectWithValue("generic");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "idle";
        state.role = action.payload.role;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "generic";
      })
      .addCase(logout.fulfilled, (state) => {
        state.role = null;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.role = action.payload.role;
        state.initialized = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.role = null;
        state.initialized = true;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.role === "admin";
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.role !== null;
