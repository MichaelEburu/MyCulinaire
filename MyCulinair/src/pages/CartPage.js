import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle } from 'lucide-react';

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('cartItems');
    if (savedItems) {
      setCartItems(JSON.parse(savedItems));
    }
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newCartItem = {
      id: Date.now(),
      name: newItem.trim(),
      addedDate: new Date().toISOString(),
    };

    setCartItems([...cartItems, newCartItem]);
    setNewItem('');
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    setShowCheckout(true);
    setTimeout(() => {
      setCartItems([]);
      setShowCheckout(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">Shopping Cart</h1>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="card mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Add item to cart..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button type="submit" className="btn btn-primary flex items-center justify-center">
            <Plus size={20} className="mr-2" />
            Add
          </button>
        </div>
      </form>

      {/* Cart Items List */}
      <div className="space-y-4 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="card flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">
                Added: {new Date(item.addedDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Checkout Button */}
      {cartItems.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleCheckout}
            className="btn btn-primary w-full md:w-auto"
            disabled={showCheckout}
          >
            {showCheckout ? (
              <span className="flex items-center justify-center">
                <CheckCircle size={20} className="mr-2" />
                Checked Out!
              </span>
            ) : (
              'Checkout'
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {cartItems.length === 0 && !showCheckout && (
        <div className="text-center py-8">
          <p className="text-gray-600">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-2">
            Add items to your shopping list above
          </p>
        </div>
      )}
    </div>
  );
}

export default CartPage; 