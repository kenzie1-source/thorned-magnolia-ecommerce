import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI, getSessionId } from '../services/api';
import { useToast } from '../hooks/use-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  cart: { items: [], sessionId: getSessionId() },
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { toast } = useToast();

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionId = getSessionId();
      const cart = await cartAPI.get(sessionId);
      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (product, options) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const sessionId = getSessionId();
      const cartItem = {
        sessionId,
        productId: product.id,
        quantity: options.quantity || 1,
        selectedColor: options.selectedColor,
        selectedSize: options.selectedSize,
        printLocation: options.printLocation || 'front',
        customizations: options.customizations || {}
      };

      const updatedCart = await cartAPI.addItem(cartItem);
      dispatch({ type: 'SET_CART', payload: updatedCart });
      
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateCartItem = async (itemIndex, updateData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionId = getSessionId();
      await cartAPI.updateItem(sessionId, itemIndex, updateData);
      await loadCart(); // Reload cart to get updated data
      
      toast({
        title: "Cart updated",
        description: "Item has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
      toast({
        title: "Error",
        description: "Failed to update cart item. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async (itemIndex) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionId = getSessionId();
      await cartAPI.removeItem(sessionId, itemIndex);
      await loadCart(); // Reload cart to get updated data
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sessionId = getSessionId();
      await cartAPI.clear(sessionId);
      dispatch({ type: 'SET_CART', payload: { items: [], sessionId } });
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
    }
  };

  const getCartItemsCount = () => {
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = (products = []) => {
    return state.cart.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      
      let itemPrice = product.price;
      
      // Add front/back premium
      if (item.printLocation === 'both') {
        if (product.type === 'sweatshirt') {
          itemPrice = 30;
        } else {
          itemPrice = 25;
        }
      }
      
      // Add size premium
      const sizePremiums = { '2XL': 2, '3XL': 4, '4XL': 6, '5XL': 8 };
      const sizePremium = sizePremiums[item.selectedSize] || 0;
      
      return total + ((itemPrice + sizePremium) * item.quantity);
    }, 0);
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemsCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};