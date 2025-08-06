// Mock data for Thorned Magnolia Collective
export const categories = [
  { id: 'teachers', name: 'Teachers', description: 'Inspiring designs for educators' },
  { id: 'mamas', name: 'Mamas', description: 'Celebrating motherhood' },
  { id: 'seasons', name: 'Seasons', description: 'Seasonal favorites' },
  { id: 'quotes', name: 'Quotes', description: 'Motivational sayings' },
  { id: 'graphic', name: 'Graphic', description: 'Bold graphic designs' },
  { id: 'dads', name: 'Dads', description: 'Dedicated to fathers' },
  { id: 'embroidery', name: 'Embroidery', description: 'Elegant embroidered pieces' },
  { id: 'seniors', name: 'Seniors', description: 'Class of 2025 and beyond' },
  { id: 'holidays', name: 'Holidays', description: 'Festive holiday themes' },
  { id: 'gamer', name: 'Gamer', description: 'Gaming enthusiasts' },
  { id: 'worship', name: 'Worship', description: 'Faith-based designs' },
  { id: 'gameday', name: 'Gameday', description: 'Sports and team spirit' }
];

export const products = [
  {
    id: 1,
    name: 'World\'s Best Teacher',
    category: 'teachers',
    price: 20,
    image: 'https://via.placeholder.com/400x400/C4B5A0/2C2C2C?text=Teacher+Shirt',
    colors: ['White', 'Black', 'Navy', 'Heather Gray'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 2,
    name: 'Mama Bear',
    category: 'mamas',
    price: 20,
    image: 'https://via.placeholder.com/400x400/D4C4B0/2C2C2C?text=Mama+Bear',
    colors: ['Rose Gold', 'White', 'Mauve', 'Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 3,
    name: 'Fall Vibes',
    category: 'seasons',
    price: 20,
    image: 'https://via.placeholder.com/400x400/8B7D6B/FAF9F7?text=Fall+Vibes',
    colors: ['Burnt Orange', 'Burgundy', 'Mustard', 'Brown'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 4,
    name: 'Be Kind',
    category: 'quotes',
    price: 20,
    image: 'https://via.placeholder.com/400x400/C4B5A0/FAF9F7?text=Be+Kind',
    colors: ['Sage', 'Pink', 'White', 'Light Blue'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 5,
    name: 'Retro Sunset',
    category: 'graphic',
    price: 20,
    image: 'https://via.placeholder.com/400x400/6B4E37/FAF9F7?text=Retro+Sunset',
    colors: ['Black', 'Navy', 'White', 'Coral'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  },
  {
    id: 6,
    name: 'Dad Joke Loading',
    category: 'dads',
    price: 20,
    image: 'https://via.placeholder.com/400x400/2C2C2C/FAF9F7?text=Dad+Jokes',
    colors: ['Black', 'Gray', 'Navy', 'White'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL']
  }
];

export const fonts = [
  { id: 'serif', name: 'Classic Serif', preview: 'Your Text Here' },
  { id: 'script', name: 'Elegant Script', preview: 'Your Text Here' },
  { id: 'modern', name: 'Modern Sans', preview: 'YOUR TEXT HERE' },
  { id: 'handwritten', name: 'Handwritten', preview: 'Your Text Here' },
  { id: 'bold', name: 'Bold Impact', preview: 'YOUR TEXT HERE' }
];

export const tshirtStyles = [
  { id: 'regular', name: 'Regular T-Shirt', basePrice: 20 },
  { id: 'vneck', name: 'V-Neck T-Shirt', basePrice: 20 },
  { id: 'sweatshirt', name: 'Sweatshirt', basePrice: 30 }
];

export const colors = [
  'White', 'Black', 'Navy', 'Gray', 'Heather Gray', 'Red', 'Royal Blue',
  'Forest Green', 'Purple', 'Maroon', 'Pink', 'Light Blue', 'Yellow',
  'Orange', 'Brown', 'Sage', 'Mauve', 'Rose Gold', 'Burnt Orange'
];

export const sizes = [
  { id: 'S', name: 'Small', extraCost: 0 },
  { id: 'M', name: 'Medium', extraCost: 0 },
  { id: 'L', name: 'Large', extraCost: 0 },
  { id: 'XL', name: 'Extra Large', extraCost: 0 },
  { id: '2XL', name: '2X Large', extraCost: 2 },
  { id: '3XL', name: '3X Large', extraCost: 4 },
  { id: '4XL', name: '4X Large', extraCost: 6 },
  { id: '5XL', name: '5X Large', extraCost: 8 }
];

// Mock cart functionality
export const mockCart = {
  items: [],
  total: 0
};

// Mock functions for cart operations
export const addToCart = (product, options) => {
  console.log('Adding to cart:', product, options);
  // In real implementation, this would update cart state
};

export const removeFromCart = (itemId) => {
  console.log('Removing from cart:', itemId);
  // In real implementation, this would remove item from cart
};

export const updateCartQuantity = (itemId, quantity) => {
  console.log('Updating quantity:', itemId, quantity);
  // In real implementation, this would update item quantity
};

export const submitCustomOrder = (orderData) => {
  console.log('Submitting custom order:', orderData);
  // In real implementation, this would send order to backend
  return Promise.resolve({ success: true, orderId: 'TMC' + Date.now() });
};