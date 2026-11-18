// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productSlice';
import cartReducer from './cartSlice';
import ordersReducer from './ordersSlice';
import authReducer from './authSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    auth: authReducer,
    profile: profileReducer,
  },
});