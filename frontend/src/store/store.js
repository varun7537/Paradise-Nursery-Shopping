// src/store/store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import cartReducer from "./cartSlice";
import productReducer from "./productSlice";
import authReducer from "./authSlice";
import ordersReducer from "./ordersSlice";
import currencyReducer from "./currencySlice";
import profileReducer from "./profileSlice";
import contactReducer from "./contactSlice";
import consultationReducer from "./consultationSlice";
import shippingReducer from "./shippingSlice";
import checkoutReducer from "./checkoutSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "currency", "auth"],
};

const rootReducer = combineReducers({
  cart:         cartReducer,
  products:     productReducer,
  auth:         authReducer,
  orders:       ordersReducer,
  currency:     currencyReducer,
  profile:      profileReducer,
  contact:      contactReducer,
  consultation: consultationReducer,
  shipping:     shippingReducer,
  checkout:     checkoutReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
        ],
        ignoredPaths: ["shipping.shippingDetails.savedAt"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);