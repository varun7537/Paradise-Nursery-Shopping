import axios from 'axios';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken  = () => localStorage.getItem('token');

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('auth:logout'));
};

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && token !== 'admin-local-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status   = error.response?.status;
    const url      = original?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/login')    ||
      url.includes('/auth/signup')   ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    if (status === 401 && !original._retry && !isAuthEndpoint) {
      clearAuth();
      return Promise.reject(error);
    }

    const serverJson = error.response?.data;
    if (serverJson) {
      error.message = serverJson.error || serverJson.message || error.message;
      error.status  = status;
    }

    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:  (email, password) => api.post('/auth/login', { email, password }),
  logout: () => Promise.resolve(),
  me:     () => api.get('/auth/me'),
};

// ─── CART ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  getCart:    ()                      => api.get('/cart'),
  addItem:    (productId, quantity=1) => api.post('/cart/add',              { productId, quantity }),
  updateItem: (productId, quantity)   => api.put('/cart/update',            { productId, quantity }),
  removeItem: (productId)             => api.delete(`/cart/remove/${productId}`),
  clearCart:  ()                      => api.delete('/cart/clear'),
};

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
export const checkoutAPI = {
  init: () => api.get('/checkout/init'),
};

// ─── SHIPPING ─────────────────────────────────────────────────────────────────
export const shippingAPI = {
  getAll: (params={}) => api.get('/shipping',        { params }),
  getOne: (id)        => api.get(`/shipping/${id}`),
  create: (body)      => api.post('/shipping',       body),
  update: (id, body)  => api.put(`/shipping/${id}`,  body),
  remove: (id)        => api.delete(`/shipping/${id}`),
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list:       (params={}) => api.get('/products',          { params }),
  get:        (id)        => api.get(`/products/${id}`),
  create:     (data)      => api.post('/products',         data),
  update:     (id, data)  => api.put(`/products/${id}`,    data),
  remove:     (id)        => api.delete(`/products/${id}`),
  categories: ()          => api.get('/products/categories'),
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list:         (params={})  => api.get('/orders',                { params }),
  get:          (id)         => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  summary:      ()           => api.get('/orders/summary'),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list:         (params={}) => api.get('/users',               { params }),
  get:          (id)        => api.get(`/users/${id}`),
  update:       (id, data)  => api.put(`/users/${id}`,         data),
  toggleStatus: (id)        => api.patch(`/users/${id}/status`),
  stats:        ()          => api.get('/users/stats'),
  me:           ()          => api.get('/users/me'),
  updateMe:     (data)      => api.put('/users/me',            data),
};

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const ticketApi = {
  getAll:     (params={})           => api.get('/tickets',                  { params }).then(r=>r.data),
  getById:    (id)                  => api.get(`/tickets/${id}`).then(r=>r.data),
  create:     (body)                => api.post('/tickets',                 body).then(r=>r.data),
  resolve:    (id)                  => api.patch(`/tickets/${id}/resolve`).then(r=>r.data),
  setStatus:  (id, status)          => api.patch(`/tickets/${id}/status`,   { status }).then(r=>r.data),
  addComment: (id, comment, author) => api.post(`/tickets/${id}/comments`,  { comment, author }).then(r=>r.data),
  remove:     (id)                  => api.delete(`/tickets/${id}`).then(r=>r.data),
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage:  (message, sessionId) =>
    api.post('/chat/message',          { message, sessionId }).then(r=>r.data),
  getHistory:   (sessionId) => api.get(`/chat/history/${sessionId}`).then(r=>r.data),
  clearSession: (sessionId) => api.delete(`/chat/session/${sessionId}`).then(r=>r.data),
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => api.get('/analytics').then(r=>r.data),
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats:          ()         => api.get('/dashboard/stats'),
  getSalesChart:     (months=6) => api.get(`/dashboard/sales-chart?months=${months}`),
  getInventoryChart: ()         => api.get('/dashboard/inventory-chart'),
  getActivity:       (limit=10) => api.get(`/dashboard/activity?limit=${limit}`),
  getSystemHealth:   ()         => api.get('/dashboard/system-health'),
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list:        ()   => api.get('/notifications'),
  markRead:    (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()   => api.patch('/notifications/read-all'),
};

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  sales: (from, to) => api.get('/reports/sales', { params: { from, to } }),
};

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
export const customersAPI = {
  list: (params = {}) => api.get('/customers', { params }),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
};

// ─── INVENTORY ────────────────────────────────────────────────────────────────
export const inventoryAPI = {
  list: (params = {}) => api.get('/inventory', { params }),
  get: (id) => api.get(`/inventory/${id}`),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  lowStock: () => api.get('/inventory/low-stock'),
};

// ─── SECURITY ────────────────────────────────────────────────────────────────
export const securityAPI = {
  getLogs: () => api.get('/security/logs'),
  getSettings: () => api.get('/security/settings'),
  updateSettings: (data) => api.put('/security/settings', data),
};
// ─── Backward-compatible lowercase aliases ────────────────────────────────────
export const analyticsApi     = analyticsAPI;
export const dashboardApi     = dashboardAPI;
export const productsApi      = productsAPI;
export const ordersApi        = ordersAPI;
export const usersApi         = usersAPI;
export const notificationsApi = notificationsAPI;
export const chatApi          = chatAPI;
export const cartApi          = cartAPI;
export const checkoutApi      = checkoutAPI;
export const shippingApi      = shippingAPI;
export const customersApi = customersAPI;
export const inventoryApi = inventoryAPI;
export const securityApi = securityAPI;

export default api;