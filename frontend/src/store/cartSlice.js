// src/store/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items:    [],   // [{ ...product, quantity }]
    wishlist: [],   // [{ ...product }]
  },
  reducers: {

    // ── CART ────────────────────────────────────────────────────────────────

    /** Add product to cart. If already exists, increment quantity. Respects stock limit. */
    addItemToCart(state, { payload: product }) {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity < (product.stock ?? Infinity)) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },

    /** Remove an item entirely by product id */
    removeItemFromCart(state, { payload: id }) {
      state.items = state.items.filter((i) => i.id !== id);
    },

    /** Set exact quantity (clamped 1-stock) */
    updateQuantity(state, { payload: { id, quantity } }) {
      const item = state.items.find((i) => i.id === id);
      if (item) {
        const max = item.stock ?? 9999;
        item.quantity = Math.min(max, Math.max(1, quantity));
      }
    },

    /** Increment quantity by 1 (respects stock limit) */
    incrementQuantity(state, { payload: id }) {
      const item = state.items.find((i) => i.id === id);
      if (item && item.quantity < (item.stock ?? 9999)) {
        item.quantity += 1;
      }
    },

    /** Decrement quantity by 1. Removes item automatically if quantity reaches 0. */
    decrementQuantity(state, { payload: id }) {
      const item = state.items.find((i) => i.id === id);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter((i) => i.id !== id);
        }
      }
    },

    /** Empty the cart */
    clearCart(state) {
      state.items = [];
    },

    // ── WISHLIST ─────────────────────────────────────────────────────────────

    /** Add product to wishlist. If already present, does nothing (no duplicates). */
    addToWishlist(state, { payload: product }) {
      const alreadyIn = state.wishlist.some((i) => i.id === product.id);
      if (!alreadyIn) {
        state.wishlist.push({ ...product });
      }
    },

    /** Remove product from wishlist by id */
    removeFromWishlist(state, { payload: id }) {
      state.wishlist = state.wishlist.filter((i) => i.id !== id);
    },

    /** Toggle: add if not wishlisted, remove if already there. */
    toggleWishlist(state, { payload: product }) {
      const idx = state.wishlist.findIndex((i) => i.id === product.id);
      if (idx !== -1) {
        state.wishlist.splice(idx, 1);
      } else {
        state.wishlist.push({ ...product });
      }
    },

    /** Move item from wishlist directly into cart */
    moveToCart(state, { payload: product }) {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity < (product.stock ?? Infinity)) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
      state.wishlist = state.wishlist.filter((i) => i.id !== product.id);
    },

    /** Empty the wishlist */
    clearWishlist(state) {
      state.wishlist = [];
    },
  },
});

export const {
  // Cart
  addItemToCart,
  removeItemFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  // Wishlist
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  moveToCart,
  clearWishlist,
} = cartSlice.actions;

// ── Aliases (both names work, no more import errors) ──────────────────────────
export const removeFromCart  = cartSlice.actions.removeItemFromCart;
export const addToCart       = cartSlice.actions.addItemToCart;

// ── Selectors ─────────────────────────────────────────────────────────────────

// Cart
export const selectCartItems = (s) => s.cart.items;
export const selectCartCount = (s) => s.cart.items.reduce((acc, i) => acc + i.quantity, 0);
export const selectCartTotal = (s) =>
  s.cart.items.reduce((acc, i) => {
    const price = i.discount
      ? i.price - (i.price * i.discount) / 100
      : i.price;
    return acc + price * i.quantity;
  }, 0);

// Wishlist
export const selectWishlistItems = (s) => s.cart.wishlist;
export const selectWishlistCount = (s) => s.cart.wishlist.length;
export const selectIsWishlisted  = (id) => (s) => s.cart.wishlist.some((i) => i.id === id);

export default cartSlice.reducer;