import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  addItemToCart,
  addToWishlist,
  removeFromWishlist,
} from "../store/cartSlice";
import { setCurrency } from "../store/currencySlice";
import useCurrencyRates from "../hooks/useCurrencyRates";

const CartPage = () => {
  const cart = useSelector((state) => state.cart.items || []);
  const wishlist = useSelector((state) => state.cart.wishlist || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currency = useSelector((state) => state.currency?.currency || "INR");
  const exchangeRates = useSelector(
    (state) => state.currency?.exchangeRates || {}
  );

  useCurrencyRates();

  const totalAmount = cart.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const exchangeRate = parseFloat(exchangeRates[currency]) || 1;
    return total + price * quantity * exchangeRate;
  }, 0);

  const totalItems = cart.reduce((total, item) => {
    return total + (parseInt(item.quantity) || 0);
  }, 0);

  const handleCurrencyChange = (event) => {
    dispatch(setCurrency(event.target.value));
  };

  const handleMoveToWishlist = (item) => {
    dispatch(addToWishlist(item));
    dispatch(removeFromCart(item.id));
  };

  const handleRemoveFromWishlist = (item) => {
    dispatch(removeFromWishlist(item.id));
  };

  const handleMoveToCartFromWishlist = (item) => {
    dispatch(addItemToCart(item));
    dispatch(removeFromWishlist(item.id));
  };

  const handleIncrement = (itemId) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    if (item) {
      dispatch(incrementQuantity({ id: itemId, quantity: item.quantity + 1 }));
    }
  };

  const handleDecrement = (itemId) => {
    const item = cart.find((cartItem) => cartItem.id === itemId);
    if (item && item.quantity > 1) {
      dispatch(decrementQuantity({ id: itemId, quantity: item.quantity - 1 }));
    }
  };

  const handleProceedToCheckout = () => {
    navigate("/shippingdetails", {
      state: {
        cartItems: cart,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        totalItems,
        currency,
      },
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Your Cart</h1>

      {/* Currency Selection */}
      <div className="mb-4">
        <select
          value={currency}
          onChange={handleCurrencyChange}
          className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      {/* Cart Section */}
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-gray-500 mb-4">Your cart is empty.</p>
          <img
            src="https://cdn.dribbble.com/users/687236/screenshots/5838300/media/e057a25942aae5272354e78afbac8e8a.png?resize=400x300&vertical=center"
            alt="Empty Cart"
            className="mx-auto mb-6 rounded-full"
            style={{ maxWidth: "300px", objectFit: "contain" }}
          />
          <button
            onClick={() => navigate("/products")}
            className="mt-4 py-2 px-6 bg-green-600 text-white rounded-lg hover:bg-green-500 transition duration-300"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-grow ml-4">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-500">
                    {currency}{" "}
                    {(
                      parseFloat(item.price) *
                      (parseFloat(exchangeRates[currency]) || 1)
                    ).toFixed(2)}{" "}
                    x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDecrement(item.id)}
                    className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(item.id)}
                    className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 transition duration-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleMoveToWishlist(item)}
                    className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition duration-200"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex justify-between mb-4">
              <span>Total Items: {totalItems}</span>
              <span>
                Total Amount: {currency} {totalAmount.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition duration-300 transform hover:scale-105"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {/* Wishlist Section */}
      {wishlist.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-green-500 mb-4">
            Your Wishlist
          </h2>
          <div className="grid gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-grow ml-4">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-500">
                    {currency}{" "}
                    {(
                      parseFloat(item.price) *
                      (parseFloat(exchangeRates[currency]) || 1)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleMoveToCartFromWishlist(item)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-400 transition duration-200"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-400 transition duration-200"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;