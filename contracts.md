# Thorned Magnolia Collective - API Contracts

## Overview
This document outlines the API contracts for transitioning from mock data to a fully functional backend for the t-shirt e-commerce website.

## Current Mock Data Structure

### Products
- **Mock File**: `/frontend/src/mock.js`
- **Data**: 8 sample products (t-shirts and sweatshirts)
- **Structure**: 
  - id, name, category, price, image, colors, sizes
  - type field for sweatshirts

### Categories
- **Categories**: Teachers, Mamas, Seasons, Quotes, Graphic, Dads, Embroidery, Seniors, Holidays, Gamer, Worship, Gameday
- **Structure**: id, name, description

### Pricing Structure
- **T-shirts**: $20 (front), $25 (front & back)
- **Sweatshirts**: $25 (front), $30 (front & back)  
- **Size Premium**: +$2 for sizes above XL (2XL, 3XL, 4XL, 5XL)

## Backend API Endpoints

### 1. Products API
- **GET /api/products** - Get all products
- **GET /api/products/category/:categoryId** - Get products by category
- **GET /api/products/:id** - Get single product
- **POST /api/products** - Admin: Add new product
- **PUT /api/products/:id** - Admin: Update product
- **DELETE /api/products/:id** - Admin: Delete product

### 2. Categories API
- **GET /api/categories** - Get all categories

### 3. Cart API
- **GET /api/cart/:sessionId** - Get cart items
- **POST /api/cart** - Add item to cart
- **PUT /api/cart/:itemId** - Update cart item
- **DELETE /api/cart/:itemId** - Remove cart item
- **DELETE /api/cart/:sessionId** - Clear cart

### 4. Custom Orders API
- **POST /api/custom-orders** - Submit custom order
- **GET /api/custom-orders** - Admin: Get all orders
- **PUT /api/custom-orders/:id/status** - Admin: Update order status
- **POST /api/upload** - Handle image uploads

### 5. Regular Orders API
- **POST /api/orders** - Place regular order
- **GET /api/orders/:email** - Get orders by customer email

## Database Models

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  category: String,
  price: Number,
  image: String,
  colors: [String],
  sizes: [String],
  type: String, // 'tshirt' or 'sweatshirt'
  inStock: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  _id: ObjectId,
  id: String, // URL-friendly ID
  name: String,
  description: String,
  displayOrder: Number
}
```

### Cart Model
```javascript
{
  _id: ObjectId,
  sessionId: String,
  items: [{
    productId: ObjectId,
    quantity: Number,
    selectedColor: String,
    selectedSize: String,
    printLocation: String, // 'front', 'back', 'both'
    customizations: Object
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Custom Order Model
```javascript
{
  _id: ObjectId,
  orderId: String, // TMC + timestamp
  customerName: String,
  email: String,
  phone: String,
  designImage: String, // File path
  designText: String,
  selectedFont: String,
  shirtStyle: String,
  shirtColor: String,
  size: String,
  printLocation: String, // 'front', 'back', 'both'
  quantity: Number,
  totalPrice: Number,
  specialInstructions: String,
  status: String, // 'pending', 'confirmed', 'in-progress', 'completed'
  createdAt: Date,
  updatedAt: Date
}
```

### Regular Order Model
```javascript
{
  _id: ObjectId,
  orderId: String,
  customerEmail: String,
  items: [CartItem],
  totalAmount: Number,
  status: String,
  shippingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration Changes

### Remove Mock Dependencies
1. Remove mock imports from components
2. Replace mock functions with API calls
3. Add loading states and error handling

### API Service Layer
Create `/frontend/src/services/api.js`:
- Product fetching functions
- Cart management functions  
- Order submission functions
- Image upload handling

### State Management
- Implement cart context/state
- Add loading states
- Error handling and user feedback

## File Upload Implementation
- **Storage**: Local filesystem with organized folders
- **Path Structure**: `/uploads/custom-orders/YYYY/MM/DD/`
- **Allowed Types**: .jpg, .jpeg, .png, .gif
- **Size Limit**: 10MB per file
- **Frontend**: Form with file input and preview

## Implementation Priority

### Phase 1: Core Product System
1. Products CRUD operations
2. Categories management
3. Product filtering and search

### Phase 2: Shopping Cart
1. Session-based cart management
2. Cart persistence
3. Price calculations

### Phase 3: Orders System
1. Custom orders with file upload
2. Regular order processing
3. Order status management

### Phase 4: Admin Features
1. Product management
2. Order management dashboard
3. File management system

## Testing Requirements
- Test all CRUD operations
- Test file upload functionality
- Test price calculations
- Test cart persistence
- Test order submission flow
- Test error handling scenarios

## Notes
- All prices include size premiums and front/back options
- Images are stored locally (not cloud storage for MVP)
- Session-based cart (no user authentication required for MVP)
- Email notifications can be added in future iterations