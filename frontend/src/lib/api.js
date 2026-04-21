import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) config.headers['x-session-id'] = sessionId;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      // Only redirect if there was a token (session expired), not for anonymous requests
      if (token) {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/password', data),
};

// Products
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getOne: (slug) => api.get(`/categories/${slug}`),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (id, data) => api.patch(`/cart/items/${id}`, data),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clear: (cartId) => api.delete('/cart', { data: { cartId } }),
};

// Orders
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

// Users
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (product_id) => api.post('/users/wishlist', { product_id }),
  getDashboard: () => api.get('/users/admin/dashboard'),
};
