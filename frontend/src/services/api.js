import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsAPI = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  getByCategory: async (categoryId) => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },
  
  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  }
};

// Cart API
export const cartAPI = {
  get: async (sessionId) => {
    try {
      const response = await api.get(`/cart/${sessionId}`);
      return response.data || { items: [], sessionId };
    } catch (error) {
      if (error.response?.status === 404) {
        return { items: [], sessionId };
      }
      throw error;
    }
  },
  
  addItem: async (cartItem) => {
    const response = await api.post('/cart', cartItem);
    return response.data;
  },
  
  updateItem: async (sessionId, itemIndex, updateData) => {
    const response = await api.put(`/cart/${sessionId}/${itemIndex}`, updateData);
    return response.data;
  },
  
  removeItem: async (sessionId, itemIndex) => {
    const response = await api.delete(`/cart/${sessionId}/${itemIndex}`);
    return response.data;
  },
  
  clear: async (sessionId) => {
    const response = await api.delete(`/cart/${sessionId}`);
    return response.data;
  }
};

// Custom Orders API
export const customOrdersAPI = {
  create: async (orderData) => {
    const response = await api.post('/custom-orders', orderData);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/custom-orders');
    return response.data;
  },
  
  getById: async (orderId) => {
    const response = await api.get(`/custom-orders/${orderId}`);
    return response.data;
  },
  
  updateStatus: async (orderId, status) => {
    const response = await api.put(`/custom-orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Regular Orders API
export const ordersAPI = {
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  
  getByEmail: async (email) => {
    const response = await api.get(`/orders/${email}`);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  }
};

// File Upload API
export const uploadAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Utility APIs
export const utilityAPI = {
  getFonts: async () => {
    const response = await api.get('/fonts');
    return response.data;
  },
  
  getSizes: async () => {
    const response = await api.get('/sizes');
    return response.data;
  },
  
  getColors: async () => {
    const response = await api.get('/colors');
    return response.data;
  },
  
  getShirtStyles: async () => {
    const response = await api.get('/shirt-styles');
    return response.data;
  }
};

// Helper functions
export const calculatePrice = (style, size, printLocation, quantity = 1) => {
  const basePrices = {
    regular: 20,
    vneck: 20,
    sweatshirt: 25
  };
  
  let basePrice = basePrices[style] || 20;
  
  // Add front/back premium
  if (printLocation === 'both') {
    if (style === 'sweatshirt') {
      basePrice = 30; // $30 for front & back sweatshirt
    } else {
      basePrice = 25; // $25 for front & back t-shirt
    }
  }
  
  // Add size premium
  const sizePremiums = { '2XL': 2, '3XL': 4, '4XL': 6, '5XL': 8 };
  const sizePremium = sizePremiums[size] || 0;
  
  return (basePrice + sizePremium) * quantity;
};

// Session management
export const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export default api;