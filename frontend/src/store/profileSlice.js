// src/store/profileSlice.js
// READ-ONLY slice — only fetches profile data for the profile page.
// It never writes to auth.user.
//
// WHY: Having two slices both write to state.auth.user caused a
// last-write-wins race that replaced the logged-in user with stale/empty
// data after a save, making the UI show "Anonymous".
//
// RULE: For any mutation (update profile, upload avatar, change password)
// import and dispatch from authSlice. This slice is for reading only.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// GET /api/users/me — populates the profile page on mount
export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/me');
      // userController.getMe returns { success: true, user: {...} }
      return data?.user ?? data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load profile.'
      );
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data:    null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    // Called by authSlice mutations so the profile page stays in sync
    // without needing a re-fetch after every save.
    setProfileData(state, { payload }) {
      if (payload && payload.id) {
        state.data = payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchProfile.fulfilled, (s, { payload }) => { s.loading = false; s.data = payload; })
      .addCase(fetchProfile.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; });
  },
});

export const { clearProfileError, setProfileData } = profileSlice.actions;

export const selectProfile        = (s) => s.profile.data;
export const selectProfileLoading = (s) => s.profile.loading;
export const selectProfileError   = (s) => s.profile.error;

export default profileSlice.reducer;