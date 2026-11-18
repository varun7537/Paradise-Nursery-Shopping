// src/store/ordersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/orders');
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch orders.'
      );
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders:  [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearOrders(state) {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchOrders.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.orders  = payload.orders || payload;
      })
      .addCase(fetchOrders.rejected,  (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      });
  },
});

export const { clearOrders } = ordersSlice.actions;

export const selectOrders        = (s) => s.orders.orders;
export const selectOrdersLoading = (s) => s.orders.loading;
export const selectOrdersError   = (s) => s.orders.error;

export default ordersSlice.reducer;