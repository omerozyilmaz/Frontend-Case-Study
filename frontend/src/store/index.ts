import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth-slice";
import { personsReducer } from "./persons-slice";
import { professionGroupsReducer } from "./profession-groups-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    persons: personsReducer,
    professionGroups: professionGroupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
