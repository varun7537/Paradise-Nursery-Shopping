// src/store/contactSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Thunk — POST /api/contact
// ─────────────────────────────────────────────────────────────────────────────
export const submitContactForm = createAsyncThunk(
  'contact/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/contact', formData);
      return data; // { success: true, message: '...', data: {...} }
    } catch (err) {
      // Server returns { error: '...' } or { errors: [{field, message}] }
      const message =
        err.response?.data?.error ||
        (err.response?.data?.errors &&
          err.response.data.errors.map((e) => e.message).join(', ')) ||
        'Failed to send message. Please try again.';
      return rejectWithValue(message);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    loading: false,
    success: false,   // true after successful submission
    error:   null,
  },
  reducers: {
    // Call this when component unmounts or user starts editing again
    resetContactState(state) {
      state.loading = false;
      state.success = false;
      state.error   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitContactForm.pending, (s) => {
        s.loading = true;
        s.success = false;
        s.error   = null;
      })
      .addCase(submitContactForm.fulfilled, (s) => {
        s.loading = false;
        s.success = true;
      })
      .addCase(submitContactForm.rejected, (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      });
  },
});

export const { resetContactState } = contactSlice.actions;

// Selectors
export const selectContactLoading = (s) => s.contact.loading;
export const selectContactSuccess = (s) => s.contact.success;
export const selectContactError   = (s) => s.contact.error;

export default contactSlice.reducer;