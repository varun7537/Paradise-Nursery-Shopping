// src/pages/ProductListing.jsx
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { ChevronLeft, ChevronRight, Loader2, ShoppingCart, Star, SlidersHorizontal } from 'lucide-react';
import { addItemToCart } from '../store/cartSlice';
import {
  fetchProducts, fetchCategories, setFilters, setPage,
  selectProducts, selectCategories, selectFilters,
  selectPagination, selectLoading, selectError,
} from '../store/productSlice';

// ── Debounce hook: avoids API call on every keystroke ─────────────────────────
function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const TAG_STYLES = {
  New: 'bg-blue-100 text-blue-700',
  Popular: 'bg-orange-100 text-orange-700',
  Limited: 'bg-purple-100 text-purple-700',
};

const FALLBACK_IMG = 'https://placehold.co/400x300?text=No+Image';

const ProductListing = () => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts) || [];
  const categories = useSelector(selectCategories) || [];
  const filters = useSelector(selectFilters) || {};
  const pagination = useSelector(selectPagination) || { page: 1, limit: 12, total: 0, totalPages: 1 };
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const {
    search = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  // Debounce text/number fields so API isn't called on every keystroke
  const dSearch = useDebounce(search, 450);
  const dMinPrice = useDebounce(minPrice, 450);
  const dMaxPrice = useDebounce(maxPrice, 450);

  // Load categories once
  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  // Whenever a *filter* changes, jump back to page 1.
  // Without this, filtering while on page 3+ can request a page that
  // no longer exists for the new result set, making the grid look empty.
  useEffect(() => {
    if (pagination.page !== 1) {
      dispatch(setPage(1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dSearch, category, dMinPrice, dMaxPrice, sortBy, sortOrder]);

  // Re-fetch whenever any filter or page changes
  useEffect(() => {
    dispatch(fetchProducts({
      search:    dSearch    || undefined,
      category:  category   || undefined,
      minPrice:  dMinPrice  || undefined,
      maxPrice:  dMaxPrice  || undefined,
      sortBy,
      sortOrder,
      page: pagination.page,
      limit: pagination.limit,
    }));
  }, [dispatch, dSearch, category, dMinPrice, dMaxPrice, sortBy, sortOrder, pagination.page, pagination.limit]);

  const setFilter  = useCallback((patch) => dispatch(setFilters(patch)), [dispatch]);
  const addToCart  = useCallback((p)     => dispatch(addItemToCart(p)),  [dispatch]);
  const clearAll   = () => setFilter({ search: '', category: '', minPrice: '', maxPrice: '' });
  const hasFilter  = search || category || minPrice || maxPrice;

  return (
    <div className="container mx-auto px-4 py-8">

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-4">

          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search plants..."
              value={search}
              onChange={(e) => setFilter({ search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setFilter({ category: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_');
              setFilter({ sortBy: sb, sortOrder: so });
            }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none min-w-[165px]"
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="rating_desc">Top Rated</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
        </div>

        {/* Price range */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500 font-medium">Price (₹):</span>
          <input
            type="number" placeholder="Min" min="0"
            value={minPrice}
            onChange={(e) => setFilter({ minPrice: e.target.value })}
            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <span className="text-gray-300">—</span>
          <input
            type="number" placeholder="Max" min="0"
            value={maxPrice}
            onChange={(e) => setFilter({ maxPrice: e.target.value })}
            className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          {hasFilter && (
            <button
              onClick={clearAll}
              className="ml-2 text-sm text-red-500 hover:text-red-700 font-medium underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Heading ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">
          Our Plants
          {!loading && pagination.total > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({pagination.total} {pagination.total === 1 ? 'result' : 'results'})
            </span>
          )}
        </h1>
        {loading && <Loader2 className="h-5 w-5 text-green-600 animate-spin" />}
      </div>

      {/* ── Error banner ────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm">
          ⚠️ {error} — make sure your backend is running at{' '}
          <code className="bg-red-100 px-1 rounded">http://localhost:5000</code>
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {loading && products.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse shadow-md">
              <div className="bg-gray-200 h-52 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                <div className="h-3 bg-gray-200 rounded-full w-full" />
                <div className="h-3 bg-gray-200 rounded-full w-1/2" />
                <div className="h-9 bg-gray-200 rounded-xl w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!loading && products.length === 0 && !error && (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No plants found</h3>
          <p className="text-gray-400 mb-4">Try adjusting your filters or search term.</p>
          {hasFilter && (
            <button
              onClick={clearAll}
              className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Product grid ────────────────────────────────────────────────────── */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            // Support both Mongo-style `_id` and plain `id`, since a
            // strict `product.id` check silently drops every Mongo document.
            const productId = product?.id ?? product?._id;
            if (!product || !productId) return null;

            const price = Number(product.price) || 0;
            const discount = Number(product.discount) || 0;
            const finalPrice = discount
              ? price - (price * discount) / 100
              : price;

            return (
              <div
                key={productId}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 group"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <Link to={`/product/${productId}`}>
                    <img
                      src={product.image || FALLBACK_IMG}
                      alt={product.name}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null; // prevent infinite error loop
                        e.target.src = FALLBACK_IMG;
                      }}
                    />
                  </Link>
                  {discount > 0 && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold py-1 px-2.5 rounded-full shadow">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-grow">
                  {Array.isArray(product.tags) && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.tags.map((tag, i) => (
                        <span key={i} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_STYLES[tag] || 'bg-gray-100 text-gray-600'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link to={`/product/${productId}`}>
                    <h2 className="text-base font-bold text-green-700 hover:underline leading-snug">{product.name}</h2>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5 mb-2">{product.category}</p>
                  <p className="text-sm text-gray-500 flex-grow line-clamp-2 mb-3">{product.description}</p>

                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">({product.rating || 0})</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto gap-2">
                    <div className="leading-tight">
                      {discount > 0 ? (
                        <>
                          <span className="block text-xs text-gray-400 line-through">₹{price}</span>
                          <span className="block text-lg font-extrabold text-green-700">₹{finalPrice.toFixed(0)}</span>
                        </>
                      ) : (
                        <span className="block text-lg font-extrabold text-green-700">₹{price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            disabled={pagination.page <= 1 || loading}
            onClick={() => dispatch(setPage(pagination.page - 1))}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('…');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '…' ? (
                <span key={`e${i}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => dispatch(setPage(p))}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                    p === pagination.page
                      ? 'bg-green-600 text-white shadow'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              )
            )}

          <button
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => dispatch(setPage(pagination.page + 1))}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition shadow-sm"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductListing;