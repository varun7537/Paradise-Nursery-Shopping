// src/store/checkoutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { checkoutAPI } from '../services/api';

// ── Thunk ─────────────────────────────────────────────────────────────────────
// GET /api/checkout/init  →  { user, cart: { items, total, totalItems } }
export const initCheckoutPage = createAsyncThunk(
  'checkout/init',
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkoutAPI.init();
      // res.data is the raw JSON: { user, cart }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message ?? 'Failed to load checkout data.');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState: {
    userProfile:    null,
    profileLoading: false,
    cart: {
      items:      [],
      total:      0,
      totalItems: 0,
    },
    cartLoading: false,
    cartError:   null,
  },
  reducers: {
    clearCheckout(state) {
      state.userProfile = null;
      state.cart        = { items: [], total: 0, totalItems: 0 };
      state.cartError   = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initCheckoutPage.pending, (state) => {
        state.profileLoading = true;
        state.cartLoading    = true;
        state.cartError      = null;
      })
      .addCase(initCheckoutPage.fulfilled, (state, { payload }) => {
        state.profileLoading = false;
        state.cartLoading    = false;
        // payload = { user, cart: { items, total, totalItems } }
        state.userProfile    = payload.user ?? null;
        state.cart           = payload.cart ?? { items: [], total: 0, totalItems: 0 };
      })
      .addCase(initCheckoutPage.rejected, (state, { payload }) => {
        state.profileLoading = false;
        state.cartLoading    = false;
        state.cartError      = payload ?? 'Failed to load checkout data.';
      });
  },
});

export const { clearCheckout } = checkoutSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
// cart.items  = array of { id, productId, name, price, quantity, subtotal, image }
// userProfile = { id, fullName, name, email, phone, role, ... }  ← from formatUser
export const selectUserProfile    = (s) => s.checkout.userProfile;
export const selectProfileLoading = (s) => s.checkout.profileLoading;
export const selectCheckoutCart   = (s) => s.checkout.cart.items;
export const selectCheckoutTotal  = (s) => s.checkout.cart.total;
export const selectCheckoutItems  = (s) => s.checkout.cart.totalItems;
export const selectCartLoading    = (s) => s.checkout.cartLoading;
export const selectCartError      = (s) => s.checkout.cartError;

export default checkoutSlice.reducer;