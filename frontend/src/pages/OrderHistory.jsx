// src/pages/OrderHistory.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectOrders } from '../store/ordersSlice';
import { ShoppingBag, Package, Clock } from 'lucide-react';

const STATUS_STYLES = {
  Confirmed:  'bg-blue-100 text-blue-700',
  Shipped:    'bg-yellow-100 text-yellow-700',
  Delivered:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-600',
};

const OrderHistory = () => {
  // selectOrders always returns an array — never undefined
  const orders = useSelector(selectOrders);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-green-600" />
        Order History
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-500 mb-1">No orders yet</p>
          <p className="text-gray-400 text-sm">Your completed orders will appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-mono text-gray-400">#{order.id}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>

              {/* Order items */}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <ul className="space-y-1 mb-3">
                  {order.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm text-gray-600">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.placedAt).toLocaleString()}
                </span>
                <span className="font-bold text-green-700">₹{order.total}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;