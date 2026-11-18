import { useDispatch } from "react-redux";
import { removeFromCart, updateQuantity } from "../store/cartSlice";
import { FaTrashAlt, FaMinus, FaPlus } from "react-icons/fa"; // Import icons for better UI

const CartItemCard = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };

  const handleQuantityChange = (change) => {
    if (item.quantity + change >= 1) {  // Prevent going below 1
      dispatch(updateQuantity({ id: item.id, change }));
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center border p-4 rounded-lg shadow-md bg-white mb-4">
      {/* Image Section */}
      <div className="flex-shrink-0 w-20 h-20">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

      {/* Product Info Section */}
      <div className="flex-1 ml-4">
        <h2 className="text-lg font-semibold text-gray-800">{item.name}</h2>
        <p className="text-green-600 font-semibold text-xl">₹{item.price}</p>
      </div>

      {/* Quantity Section */}
      <div className="flex items-center mt-2 md:mt-0">
        <button
          onClick={() => handleQuantityChange(-1)}
          className="bg-gray-200 text-gray-600 hover:bg-gray-300 px-3 py-1 rounded-full focus:outline-none"
          aria-label="Decrease quantity"
        >
          <FaMinus />
        </button>

        <span className="mx-4 text-lg font-semibold text-gray-800">{item.quantity}</span>

        <button
          onClick={() => handleQuantityChange(1)}
          className="bg-gray-200 text-gray-600 hover:bg-gray-300 px-3 py-1 rounded-full focus:outline-none"
          aria-label="Increase quantity"
        >
          <FaPlus />
        </button>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleRemove}
        className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 ml-4 rounded-lg flex items-center gap-2 focus:outline-none"
        aria-label="Remove item from cart"
      >
        <FaTrashAlt />
        Delete
      </button>
    </div>
  );
};

export default CartItemCard;
