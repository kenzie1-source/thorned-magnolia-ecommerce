import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from './ui/sheet';
import { Badge } from './ui/badge';
import { ShoppingBag, X, Plus, Minus, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { productsAPI } from '../services/api';
import StripeCheckout from './StripeCheckout';
import { useToast } from '../hooks/use-toast';

const ShoppingCart = () => {
  const { cart, removeFromCart, updateCartItem, getCartItemsCount, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await productsAPI.getAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  const calculateItemPrice = (item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return 0;

    let price = product.price;
    
    // Add front/back premium
    if (item.printLocation === 'both') {
      if (product.type === 'sweatshirt') {
        price = 30;
      } else {
        price = 25;
      }
    }
    
    // Add size premium
    const sizePremiums = { '2XL': 2, '3XL': 4, '4XL': 6, '5XL': 8 };
    const sizePremium = sizePremiums[item.selectedSize] || 0;
    
    return (price + sizePremium) * item.quantity;
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const updateQuantity = async (itemIndex, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemIndex);
    } else {
      await updateCartItem(itemIndex, { quantity: newQuantity });
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }
    setShowCheckout(true);
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Create order in backend
      const orderData = {
        customerEmail: paymentIntent.charges.data[0].billing_details.email,
        items: cart.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            productName: product?.name || 'Unknown Product',
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            printLocation: item.printLocation,
            unitPrice: product?.price || 0,
            totalPrice: calculateItemPrice(item)
          };
        }),
        subtotal: calculateTotal(),
        totalAmount: calculateTotal(),
        paymentIntentId: paymentIntent.id
      };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        await clearCart();
        setShowCheckout(false);
        setIsOpen(false);
        
        toast({
          title: "Order Complete!",
          description: "Thank you for your purchase. You'll receive a confirmation email shortly.",
        });
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  if (showCheckout) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          <StripeCheckout
            amount={calculateTotal()}
            orderData={{
              items: cart.items,
              type: 'regular_order'
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowCheckout(false)}
            title="Complete Your Order"
          />
        </div>
      </div>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <ShoppingBag className="h-5 w-5 text-charcoal" />
          {getCartItemsCount() > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-warm-sage text-cream-white min-w-5 h-5 flex items-center justify-center text-xs">
              {getCartItemsCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-96 bg-cream-white">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-warm-sage" />
            Shopping Cart ({getCartItemsCount()})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-warm-gray mx-auto mb-4" />
              <p className="text-warm-gray">Your cart is empty</p>
              <p className="text-sm text-warm-gray">Add some beautiful items to get started!</p>
            </div>
          ) : (
            cart.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              if (!product) return null;

              return (
                <Card key={index} className="border border-soft-gray">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal">{product.name}</h4>
                        <div className="text-sm text-warm-gray space-y-1">
                          <p>Color: {item.selectedColor}</p>
                          <p>Size: {item.selectedSize}</p>
                          <p>Print: {item.printLocation === 'both' ? 'Front & Back' : 'Front Only'}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(index)}
                        className="text-warm-gray hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-semibold text-rich-chocolate">
                        ${calculateItemPrice(item).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="mt-6 border-t border-soft-gray pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-charcoal">Total</span>
              <span className="text-xl font-bold text-rich-chocolate">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                className="w-full btn-primary"
                onClick={handleCheckout}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCart;