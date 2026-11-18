// src/store/currencySlice.js
import { createSlice } from '@reduxjs/toolkit';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currency: localStorage.getItem('currency') || 'INR',
    rates:    {},   // e.g. { USD: 0.012, EUR: 0.011 }
  },
  reducers: {
    setCurrency(state, { payload }) {
      state.currency = payload;
      localStorage.setItem('currency', payload);
    },
    setRates(state, { payload }) {
      state.rates = payload;
    },
  },
});

export const { setCurrency, setRates } = currencySlice.actions;

export const selectCurrency = (s) => s.currency.currency;
export const selectRates    = (s) => s.currency.rates;

export default currencySlice.reducer;