// src/store/shippingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shippingAPI } from '../services/api';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchShippingAddresses = createAsyncThunk(
  'shipping/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await shippingAPI.getAll();
      return res.data; // { addresses, pagination }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createShipping = createAsyncThunk(
  'shipping/create',
  async (body, { rejectWithValue }) => {
    try {
      const res = await shippingAPI.create(body);
      return res.data; // { address, cart }
    } catch (err) {
      // Propagate 422 field errors so ShippingDetails can show them
      const errors = err.response?.data?.errors ?? null;
      return rejectWithValue({ message: err.message, errors });
    }
  }
);

export const updateShipping = createAsyncThunk(
  'shipping/update',
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const res = await shippingAPI.update(id, body);
      return res.data; // { address }
    } catch (err) {
      const errors = err.response?.data?.errors ?? null;
      return rejectWithValue({ message: err.message, errors });
    }
  }
);

export const deleteShipping = createAsyncThunk(
  'shipping/delete',
  async (id, { rejectWithValue }) => {
    try {
      await shippingAPI.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const shippingSlice = createSlice({
  name: 'shipping',
  initialState: {
    addresses:        [],
    selectedAddress:  null,   // the saved/active address for current checkout
    loading:          false,
    error:            null,
    success:          false,
    validationErrors: [],     // array of { field, message } from 422 response
  },
  reducers: {
    clearStatus(state) {
      state.error            = null;
      state.success          = false;
      state.validationErrors = [];
    },
    setSelectedAddress(state, { payload }) {
      state.selectedAddress = payload;
    },
  },
  extraReducers: (builder) => {
    // ── fetchAll ─────────────────────────────────────────────────────────────
    builder
      .addCase(fetchShippingAddresses.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchShippingAddresses.fulfilled, (state, { payload }) => {
        state.loading   = false;
        state.addresses = payload.addresses ?? [];
        // Auto-select default address if none selected
        if (!state.selectedAddress) {
          state.selectedAddress =
            state.addresses.find((a) => a.isDefault) ?? state.addresses[0] ?? null;
        }
      })
      .addCase(fetchShippingAddresses.rejected,  (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });

    // ── create ────────────────────────────────────────────────────────────────
    builder
      .addCase(createShipping.pending,   (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(createShipping.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.success         = true;
        state.selectedAddress = payload.address ?? null;
        if (payload.address) {
          state.addresses.unshift(payload.address);
        }
      })
      .addCase(createShipping.rejected,  (state, { payload }) => {
        state.loading          = false;
        state.error            = payload?.message ?? 'Failed to save address.';
        state.validationErrors = payload?.errors  ?? [];
      });

    // ── update ────────────────────────────────────────────────────────────────
    builder
      .addCase(updateShipping.pending,   (state) => { state.loading = true; state.error = null; state.success = false; })
      .addCase(updateShipping.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.success         = true;
        state.selectedAddress = payload.address ?? null;
        const idx = state.addresses.findIndex((a) => a.id === payload.address?.id);
        if (idx !== -1) state.addresses[idx] = payload.address;
      })
      .addCase(updateShipping.rejected,  (state, { payload }) => {
        state.loading          = false;
        state.error            = payload?.message ?? 'Failed to update address.';
        state.validationErrors = payload?.errors  ?? [];
      });

    // ── delete ────────────────────────────────────────────────────────────────
    builder
      .addCase(deleteShipping.pending,   (state) => { state.loading = true; })
      .addCase(deleteShipping.fulfilled, (state, { payload: id }) => {
        state.loading   = false;
        state.addresses = state.addresses.filter((a) => a.id !== id);
        if (state.selectedAddress?.id === id) state.selectedAddress = null;
      })
      .addCase(deleteShipping.rejected,  (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });
  },
});

export const { clearStatus, setSelectedAddress } = shippingSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectShippingAddresses  = (s) => s.shipping.addresses;
export const selectShippingDetails    = (s) => s.shipping.selectedAddress;
export const selectShippingLoading    = (s) => s.shipping.loading;
export const selectShippingError      = (s) => s.shipping.error;
export const selectShippingSuccess    = (s) => s.shipping.success;
export const selectValidationErrors   = (s) => s.shipping.validationErrors;

export default shippingSlice.reducer;