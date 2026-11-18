// src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Star, ShoppingCart, Package } from 'lucide-react';
import { addItemToCart } from '../store/cartSlice';

const TAG_STYLES = {
  New:     'bg-blue-100 text-blue-700',
  Popular: 'bg-orange-100 text-orange-700',
  Limited: 'bg-purple-100 text-purple-700',
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  if (!product || !product.id) return null;

  const discountedPrice = product.discount
    ? (product.price - (product.price * product.discount) / 100).toFixed(0)
    : product.price;

  const stockStatus =
    product.stock > 10  ? { label: 'In Stock',          cls: 'text-green-600' } :
    product.stock > 0   ? { label: `Only ${product.stock} left`, cls: 'text-orange-500' } :
                          { label: 'Out of Stock',       cls: 'text-red-500' };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 group">

      {/* ── Image ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Plant'; }}
          />
        </Link>
        {product.discount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold py-1 px-2.5 rounded-full shadow">
            {product.discount}% OFF
          </span>
        )}
        {!product.isActive && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">Inactive</span>
          </div>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Tags */}
        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_STYLES[tag] || 'bg-gray-100 text-gray-600'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link to={`/product/${product.id}`}>
          <h3 className="text-base font-bold text-green-700 hover:underline leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5 mb-2">{product.category}</p>
        <p className="text-sm text-gray-500 flex-grow line-clamp-2 mb-3">{product.description}</p>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.rating || 0})</span>
        </div>

        {/* Stock status */}
        <p className={`text-xs font-medium mb-3 ${stockStatus.cls}`}>
          <Package className="inline h-3 w-3 mr-1" />
          {stockStatus.label}
        </p>

        {/* Price + Cart ── */}
        <div className="flex items-center justify-between mt-auto gap-2">
          <div className="leading-tight">
            {product.discount ? (
              <>
                <span className="block text-xs text-gray-400 line-through">₹{product.price}</span>
                <span className="block text-lg font-extrabold text-green-700">₹{discountedPrice}</span>
              </>
            ) : (
              <span className="block text-lg font-extrabold text-green-700">₹{product.price}</span>
            )}
          </div>

          <button
            onClick={() => dispatch(addItemToCart(product))}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {product.stock === 0 ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;