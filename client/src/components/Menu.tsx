import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock, 
  LogOut,
  User,
  ChefHat,
  Filter
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { menuApi, ordersApi } from '../services/api';
import type { MenuItem, CartItem, OrderRequest } from '../types';
import toast from 'react-hot-toast';

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await menuApi.getMenuItems();
      console.log('Loaded menu items:', items);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    // Show all items for now
    return matchesCategory;
  });

  console.log('Menu items:', menuItems);
  console.log('Filtered items:', filteredItems);
  console.log('Categories:', categories);

  const addToCart = (item: MenuItem) => {
    // Check if item is available
    if (item.available === 0) {
      toast.error(`${item.name} is out of stock`);
      return;
    }

    // Check if adding would exceed available quantity
    const currentQuantity = getCartItemQuantity(item.id);
    if (currentQuantity >= item.available) {
      toast.error(`Only ${item.available} ${item.name} available`);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Show confirmation
    const totalAmount = getCartTotal();
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (!window.confirm(`Place order for ${itemCount} item(s) totaling ₹${totalAmount.toFixed(2)}?`)) {
      return;
    }

    setIsOrdering(true);
    try {
      const orderData: OrderRequest = {
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      };

      const placedOrder = await ordersApi.placeOrder(orderData);
      setCart([]);
      
      // Show success with order details
      toast.success(
        `Order #${String(placedOrder.id || 'XXXXXX').slice(-6)} placed successfully! 
        Total: ₹${totalAmount.toFixed(2)}`, 
        { duration: 4000 }
      );
      
      console.log('Order placed:', placedOrder);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img src="/src/assets/SXEC canteen.png" alt="SXEC Canteen Logo" className="h-8 w-8 object-contain" />
              <h1 className="text-xl font-bold text-gray-900">SXEC Canteen</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user?.name}</span>
              </div>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Admin Panel</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-3">
            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Debug Info - Remove this later */}
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
              <p className="text-sm text-yellow-700">Total menu items: {menuItems.length}</p>
              <p className="text-sm text-yellow-700">Filtered items: {filteredItems.length}</p>
              <p className="text-sm text-yellow-700">Selected category: {selectedCategory}</p>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-all duration-300 overflow-hidden group max-w-sm mx-auto w-full">
                  {/* Item Image */}
                  {item.image && (
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-4 lg:p-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight flex-1">
                          {item.name}
                        </h3>
                        <span className="text-xl lg:text-2xl font-bold text-orange-600 ml-2 flex-shrink-0">
                          ₹{item.price}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 lg:px-3 py-1 bg-orange-100 text-orange-800 text-xs lg:text-sm font-medium rounded-full">
                          {item.category}
                        </span>
                        
                        <div className="flex items-center space-x-1 text-xs lg:text-sm text-gray-500">
                          <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>{item.prepTime || 15} min</span>
                        </div>
                      </div>
                      
                      {/* Availability Status */}
                      <div className="flex items-center space-x-2 mb-4">
                        <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full ${
                          item.available > 10 ? 'bg-green-500' : 
                          item.available > 0 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`text-xs lg:text-sm font-medium ${
                          item.available > 10 ? 'text-green-600' : 
                          item.available > 0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.available > 0 ? `${item.available} available` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-center">
                      {item.available === 0 ? (
                        <button
                          disabled
                          className="w-full py-2 lg:py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium text-sm lg:text-base"
                        >
                          Out of Stock
                        </button>
                      ) : getCartItemQuantity(item.id) > 0 ? (
                        <div className="flex items-center justify-center space-x-3 lg:space-x-4 w-full">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
                          >
                            <Minus className="h-4 w-4 lg:h-5 lg:w-5" />
                          </button>
                          <span className="text-base lg:text-lg font-bold text-gray-900 min-w-[2.5rem] lg:min-w-[3rem] text-center">
                            {getCartItemQuantity(item.id)}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={getCartItemQuantity(item.id) >= item.available}
                            className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full py-2 lg:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 font-medium shadow-sm hover:shadow-md text-sm lg:text-base"
                        >
                          <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
                  {cart.length > 0 && (
                    <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Your cart is empty</p>
                    <p className="text-sm text-gray-500 mt-1">Add items from the menu to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 mb-1">{item.category}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                ₹{item.price} × {item.quantity}
                              </span>
                              <span className="text-sm font-semibold text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-3">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 bg-white border border-gray-300 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              disabled={item.quantity >= item.available}
                              className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                        <span className="text-gray-900">₹{getCartTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estimated time</span>
                        <span className="text-gray-900">
                          {Math.max(...cart.map(item => item.prepTime || 15))} min
                        </span>
                      </div>
                      <div className="border-t pt-2 flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-orange-600">
                          ₹{getCartTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={isOrdering}
                      className="w-full mt-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium shadow-sm hover:shadow-md"
                    >
                      {isOrdering ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Place Order • ₹{getCartTotal().toFixed(2)}</span>
                        </>
                      )}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Order will be confirmed after payment
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
