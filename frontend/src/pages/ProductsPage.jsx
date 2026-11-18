// src/pages/ProductsPage.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import {
  fetchProducts, fetchCategories,
  selectProducts, selectLoading, selectError,
} from '../store/productSlice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts) || [];
  const loading  = useSelector(selectLoading);
  const error    = useSelector(selectError);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 12 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchProducts({ page: 1, limit: 12 }))}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🌿</div>
          <p className="text-lg font-medium">No products available.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;