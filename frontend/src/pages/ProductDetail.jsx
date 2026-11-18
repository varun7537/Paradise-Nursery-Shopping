// src/pages/ProductDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Star, ShoppingCart, Loader2, Tag, Package, RefreshCw } from 'lucide-react';
import {
  fetchProductById, clearSelected,
  selectSelected, selectLoading, selectError,
} from '../store/productSlice';
import { addItemToCart } from '../store/cartSlice';

const ProductDetail = () => {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const product    = useSelector(selectSelected);
  const loading    = useSelector(selectLoading);
  const error      = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSelected());
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="container mx-auto p-12 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-12 text-center">
        <div className="text-5xl mb-4">🌿</div>
        <p className="text-red-500 mb-2 text-lg font-semibold">{error || 'Product not found.'}</p>
        <p className="text-gray-400 text-sm mb-6">The product you're looking for may have been removed.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-green-600 border border-green-600 hover:bg-green-50 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to products
          </button>
          <button
            onClick={() => dispatch(fetchProductById(id))}
            className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  const stockStatus =
    product.stock > 10 ? { label: '✓ In Stock',              cls: 'text-green-600' } :
    product.stock > 0  ? { label: `Only ${product.stock} left!`, cls: 'text-orange-500' } :
                         { label: '✗ Out of Stock',           cls: 'text-red-500' };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 font-medium text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </button>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* ── Image ─────────────────────────────────────────────────────── */}
          <div className="md:w-1/2 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 md:h-full object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Plant'; }}
            />
            {product.discount && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-full text-sm shadow">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* ── Info ──────────────────────────────────────────────────────── */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                {product.category}
              </span>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                      tag === 'New'     ? 'bg-blue-100 text-blue-700'     :
                      tag === 'Popular' ? 'bg-orange-100 text-orange-700' :
                      tag === 'Limited' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Tag className="h-3 w-3" />{tag}
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-600 text-base leading-relaxed mb-6">{product.description}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
                />
              ))}
              <span className="text-gray-500 text-sm font-medium">{product.rating} / 5</span>
            </div>

            {/* Price */}
            <div className="mb-4">
              {product.discount ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-green-700">₹{discountedPrice.toFixed(0)}</span>
                  <span className="text-lg line-through text-gray-400">₹{product.price}</span>
                  <span className="text-sm font-semibold text-red-500">Save {product.discount}%</span>
                </div>
              ) : (
                <span className="text-3xl font-extrabold text-green-700">₹{product.price}</span>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm mb-6 font-medium flex items-center gap-1.5 ${stockStatus.cls}`}>
              <Package className="h-4 w-4" />
              {stockStatus.label}
            </p>

            <button
              onClick={() => dispatch(addItemToCart(product))}
              disabled={product.stock === 0}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;