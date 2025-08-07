import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useCart } from '../contexts/CartContext';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrintLocation, setSelectedPrintLocation] = useState('front');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Available sizes for all products (as per user requirement: S through 4XL)
  const availableSizes = [
    { id: 'S', name: 'Small', extraCost: 0 },
    { id: 'M', name: 'Medium', extraCost: 0 },
    { id: 'L', name: 'Large', extraCost: 0 },
    { id: 'XL', name: 'Extra Large', extraCost: 0 },
    { id: '2XL', name: '2X Large', extraCost: 2 },
    { id: '3XL', name: '3X Large', extraCost: 2 },
    { id: '4XL', name: '4X Large', extraCost: 2 }
  ];

  // Available colors (as per user requirement)
  const availableColors = [
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'Grey', value: 'grey', hex: '#808080' },
    { name: 'White', value: 'white', hex: '#ffffff' },
    { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { name: 'Blue', value: 'blue', hex: '#0066CC' },
    { name: 'Red', value: 'red', hex: '#DC3545' }
  ];

  // Reset selections when modal opens with a new product
  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(availableColors[0].value);
      setSelectedSize('M');
      setSelectedPrintLocation('front');
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const calculatePrice = () => {
    if (!selectedSize) return product.price;

    const selectedSizeData = availableSizes.find(size => size.id === selectedSize);
    const sizeUpcharge = selectedSizeData ? selectedSizeData.extraCost : 0;
    
    let basePrice = product.price;
    
    // Add price for back printing based on product type
    if (selectedPrintLocation === 'both') {
      if (product.type === 'sweatshirt') {
        basePrice = 30; // Sweatshirt front + back = $30
      } else {
        basePrice = 25; // T-shirt front + back = $25
      }
    }
    
    return (basePrice + sizeUpcharge) * quantity;
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select both color and size');
      return;
    }

    const cartItem = {
      selectedColor,
      selectedSize,
      printLocation: selectedPrintLocation,
      quantity
    };

    await addToCart(product, cartItem);
    onClose();
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-soft-gray">
          <h2 className="text-2xl font-light text-charcoal">{product.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-warm-gray hover:text-charcoal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Product Image */}
          <div className="mb-6">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Badge className="mt-2 bg-warm-sage text-cream-white">
              {product.type === 'sweatshirt' ? 'Sweatshirt' : 'T-Shirt'}
            </Badge>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal mb-3">
              Color <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {availableColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`p-3 border-2 rounded-lg flex items-center space-x-2 transition-all ${
                    selectedColor === color.value
                      ? 'border-warm-sage bg-soft-gray'
                      : 'border-soft-gray hover:border-warm-gray'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full border border-warm-gray"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm text-charcoal">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal mb-3">
              Size <span className="text-red-500">*</span>
            </label>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name} {size.extraCost > 0 && `(+$${size.extraCost})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Print Location */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal mb-3">
              Print Location
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPrintLocation('front')}
                className={`p-3 border-2 rounded-lg text-sm transition-all ${
                  selectedPrintLocation === 'front'
                    ? 'border-warm-sage bg-soft-gray text-charcoal'
                    : 'border-soft-gray text-warm-gray hover:border-warm-gray'
                }`}
              >
                Front Only
              </button>
              <button
                onClick={() => setSelectedPrintLocation('both')}
                className={`p-3 border-2 rounded-lg text-sm transition-all ${
                  selectedPrintLocation === 'both'
                    ? 'border-warm-sage bg-soft-gray text-charcoal'
                    : 'border-soft-gray text-warm-gray hover:border-warm-gray'
                }`}
              >
                Front & Back (+$5)
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal mb-3">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium text-charcoal w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Price Display */}
          <div className="mb-6 p-4 bg-soft-gray rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-charcoal">Total Price:</span>
              <span className="text-2xl font-semibold text-rich-chocolate">
                {formatPrice(calculatePrice())}
              </span>
            </div>
            {quantity > 1 && (
              <p className="text-sm text-warm-gray mt-1">
                {formatPrice(calculatePrice() / quantity)} each × {quantity}
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full btn-primary flex items-center justify-center space-x-2"
            disabled={!selectedColor || !selectedSize}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;