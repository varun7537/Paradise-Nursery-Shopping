// src/store/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API = `${BASE_URL}/products`;

const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned an unexpected response (status ${res.status}).`);
  }

  if (!res.ok) {
    const message = data.error
      || (data.errors && data.errors.map((e) => e.message).join(', '))
      || 'Something went wrong.';
    throw new Error(message);
  }
  return data;
};

/** GET /api/products — list with filters, search, sort, pagination */
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const q = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
        )
      ).toString();
      return await apiFetch(`${API}?${q}`, { signal });
    } catch (err) {
      if (err.name === 'AbortError') {
        return rejectWithValue(null);
      }
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/products/categories */
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await apiFetch(`${API}/categories`);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** GET /api/products/:id */
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await apiFetch(`${API}/${id}`);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** POST /api/products */
export const createProduct = createAsyncThunk(
  'products/create',
  async (data, { rejectWithValue }) => {
    try {
      return await apiFetch(API, { method: 'POST', body: JSON.stringify(data) });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** PUT /api/products/:id */
export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      return await apiFetch(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** DELETE /api/products/:id  (?hard=true for permanent) */
export const deleteProduct = createAsyncThunk(
  'products/delete',
  async ({ id, hard = false }, { rejectWithValue }) => {
    try {
      await apiFetch(`${API}/${id}${hard ? '?hard=true' : ''}`, { method: 'DELETE' });
      return { id };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** PATCH /api/products/:id/stock */
export const updateStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, stock }, { rejectWithValue }) => {
    try {
      return await apiFetch(`${API}/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock }),
      });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** PATCH /api/products/:id/toggle-active */
export const toggleProductActive = createAsyncThunk(
  'products/toggleActive',
  async (id, { rejectWithValue }) => {
    try {
      return await apiFetch(`${API}/${id}/toggle-active`, { method: 'PATCH' });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items:      [],
    selected:   null,
    categories: [],
    filters: {
      search:    '',
      category:  '',
      minPrice:  '',
      maxPrice:  '',
      sortBy:    'created_at',
      sortOrder: 'desc',
    },
    pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
    loading:   false,
    saving:    false,
    deleting:  false,
    error:     null,
    saveError: null,
    latestRequestId: null,
  },

  reducers: {
    setFilters(state, { payload }) {
      state.filters    = { ...state.filters, ...payload };
      state.pagination = { ...state.pagination, page: 1 };
    },
    setPage(state, { payload }) {
      state.pagination.page = payload;
    },
    clearSelected(state) {
      state.selected = null;
    },
    clearErrors(state) {
      state.error     = null;
      state.saveError = null;
    },
  },

  extraReducers: (builder) => {

    builder
      .addCase(fetchProducts.pending, (s, action) => {
        s.loading = true;
        s.error = null;
        s.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (s, action) => {
        if (action.meta.requestId !== s.latestRequestId) return;
        const { payload } = action;
        s.loading    = false;
        s.items      = payload.products;
        s.pagination = {
          page:       payload.page,
          limit:      payload.limit,
          total:      payload.total,
          totalPages: payload.totalPages,
        };
      })
      .addCase(fetchProducts.rejected, (s, action) => {
        if (action.meta.requestId !== s.latestRequestId) return;
        s.loading = false;
        if (action.payload) s.error = action.payload;
      });

    builder
      .addCase(fetchCategories.fulfilled, (s, { payload }) => { s.categories = payload; });

    builder
      .addCase(fetchProductById.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchProductById.fulfilled, (s, { payload }) => { s.loading = false; s.selected = payload; })
      .addCase(fetchProductById.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; });

    builder
      .addCase(createProduct.pending,   (s) => { s.saving = true;  s.saveError = null; })
      .addCase(createProduct.fulfilled, (s, { payload }) => {
        s.saving = false;
        s.items.unshift(payload);
        s.pagination.total += 1;
      })
      .addCase(createProduct.rejected,  (s, { payload }) => { s.saving = false; s.saveError = payload; });

    builder
      .addCase(updateProduct.pending,   (s) => { s.saving = true;  s.saveError = null; })
      .addCase(updateProduct.fulfilled, (s, { payload }) => {
        s.saving = false;
        s.selected = payload;
        const idx = s.items.findIndex((p) => p.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
      })
      .addCase(updateProduct.rejected,  (s, { payload }) => { s.saving = false; s.saveError = payload; });

    builder
      .addCase(deleteProduct.pending,   (s) => { s.deleting = true; })
      .addCase(deleteProduct.fulfilled, (s, { payload }) => {
        s.deleting     = false;
        s.items        = s.items.filter((p) => p.id !== payload.id);
        s.pagination.total = Math.max(0, s.pagination.total - 1);
      })
      .addCase(deleteProduct.rejected,  (s) => { s.deleting = false; });

    builder
      .addCase(updateStock.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex((p) => p.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
        if (s.selected?.id === payload.id) s.selected = payload;
      });

    builder
      .addCase(toggleProductActive.fulfilled, (s, { payload }) => {
        const idx = s.items.findIndex((p) => p.id === payload.id);
        if (idx !== -1) s.items[idx] = payload;
      });
  },
});

export const { setFilters, setPage, clearSelected, clearErrors } = productSlice.actions;

export const selectProducts   = (s) => s.products.items;
export const selectSelected   = (s) => s.products.selected;
export const selectCategories = (s) => s.products.categories;
export const selectFilters    = (s) => s.products.filters;
export const selectPagination = (s) => s.products.pagination;
export const selectLoading    = (s) => s.products.loading;
export const selectSaving     = (s) => s.products.saving;
export const selectDeleting   = (s) => s.products.deleting;
export const selectError      = (s) => s.products.error;
export const selectSaveError  = (s) => s.products.saveError;
export default productSlice.reducer;