import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UsersState, User } from '../../types/types';

const initialState: UsersState = {
  users: [],
  loading: false,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersStarted(state) {
      state.loading = true;
    },
    fetchUsersSuccess(state, action: PayloadAction<{ users: User[] }>) {
      state.loading = false;
      state.users = action.payload.users;
    },
    fetchUsersFailure(state) {
      state.loading = false;
    },
  },
});

export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;
