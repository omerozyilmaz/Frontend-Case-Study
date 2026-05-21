import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchProfessionGroups } from "@/api/persons-api";
import { ApiError } from "@/api/api-client";
import { logout } from "./auth-slice";
import type { ProfessionGroup } from "@/types/api";
import type { RequestStatus } from "@/types/common";

interface ProfessionGroupsState {
  items: ProfessionGroup[];
  status: RequestStatus;
}

const initialState: ProfessionGroupsState = {
  items: [],
  status: "idle",
};

export const loadProfessionGroups = createAsyncThunk(
  "professionGroups/load",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProfessionGroups();
    } catch (e) {
      return rejectWithValue(e instanceof ApiError ? e.message : "generic");
    }
  },
);

const slice = createSlice({
  name: "professionGroups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProfessionGroups.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadProfessionGroups.fulfilled, (state, action) => {
        state.status = "idle";
        state.items = action.payload;
      })
      .addCase(loadProfessionGroups.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const professionGroupsReducer = slice.reducer;
