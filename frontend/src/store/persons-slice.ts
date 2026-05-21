import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { createPerson, deletePerson, fetchPersons, updatePerson } from "@/api/persons-api";
import { ApiError } from "@/api/api-client";
import { logout } from "./auth-slice";
import type { PersonListItem, PersonListParams } from "@/types/api";
import type { PersonFormValues } from "@/schemas/person-schema";
import type { RequestStatus } from "@/types/common";

const defaultListParams: PersonListParams = {
  page: 1,
  size: 20,
  sortField: "created_at",
  sortDirection: "desc",
  professionGroupIds: [],
  nameContains: "",
  tcknPrefix: "",
};

type SuccessKind = "create" | "update" | "delete";

interface PersonsState {
  listParams: PersonListParams;
  items: PersonListItem[];
  total: number;
  listStatus: RequestStatus;
  listError: string | null;
  formStatus: RequestStatus;
  formError: string | null;
  success: SuccessKind | null;
}

const initialState: PersonsState = {
  listParams: defaultListParams,
  items: [],
  total: 0,
  listStatus: "idle",
  listError: null,
  formStatus: "idle",
  formError: null,
  success: null,
};

function rejectMessage(e: unknown) {
  return e instanceof ApiError ? e.message : "generic";
}

export const loadPersons = createAsyncThunk(
  "persons/load",
  async (params: PersonListParams, { rejectWithValue }) => {
    try {
      return await fetchPersons(params);
    } catch (e) {
      return rejectWithValue(rejectMessage(e));
    }
  },
);

export const savePerson = createAsyncThunk(
  "persons/save",
  async ({ id, values }: { id?: number; values: PersonFormValues }, { rejectWithValue }) => {
    try {
      const saved = id ? await updatePerson(id, values) : await createPerson(values);
      return { saved, isUpdate: Boolean(id) };
    } catch (e) {
      return rejectWithValue(rejectMessage(e));
    }
  },
);

export const removePerson = createAsyncThunk(
  "persons/remove",
  async (id: number, { rejectWithValue }) => {
    try {
      await deletePerson(id);
      return id;
    } catch (e) {
      return rejectWithValue(rejectMessage(e));
    }
  },
);

const personsSlice = createSlice({
  name: "persons",
  initialState,
  reducers: {
    setListParams(state, action: PayloadAction<Partial<PersonListParams>>) {
      state.listParams = { ...state.listParams, ...action.payload };
    },
    resetFilters(state) {
      state.listParams = {
        ...state.listParams,
        page: 1,
        professionGroupIds: [],
        nameContains: "",
        tcknPrefix: "",
      };
    },
    toggleSort(state, action: PayloadAction<PersonListParams["sortField"]>) {
      const field = action.payload;
      if (state.listParams.sortField === field) {
        state.listParams.sortDirection = state.listParams.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.listParams.sortField = field;
        state.listParams.sortDirection = "asc";
      }
      state.listParams.page = 1;
    },
    clearFormError(state) {
      state.formError = null;
    },
    clearListError(state) {
      state.listError = null;
    },
    clearSuccess(state) {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPersons.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(loadPersons.fulfilled, (state, action) => {
        state.listStatus = "idle";
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(loadPersons.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = (action.payload as string) ?? "generic";
      })
      .addCase(savePerson.pending, (state) => {
        state.formStatus = "loading";
        state.formError = null;
      })
      .addCase(savePerson.fulfilled, (state, action) => {
        state.formStatus = "idle";
        state.success = action.payload.isUpdate ? "update" : "create";
      })
      .addCase(savePerson.rejected, (state, action) => {
        state.formStatus = "failed";
        state.formError = (action.payload as string) ?? "generic";
      })
      .addCase(removePerson.fulfilled, (state) => {
        state.success = "delete";
      })
      .addCase(logout.fulfilled, () => initialState);
  },
});

export const {
  setListParams,
  resetFilters,
  toggleSort,
  clearFormError,
  clearListError,
  clearSuccess,
} = personsSlice.actions;

export const personsReducer = personsSlice.reducer;
