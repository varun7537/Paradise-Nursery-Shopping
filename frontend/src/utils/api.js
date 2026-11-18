// src/utils/api.js

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res  = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    // Server returns { error: '...' } or { errors: [{field, message}] }
    const message =
      data.error ||
      (data.errors && data.errors.map((e) => e.message).join(', ')) ||
      'Something went wrong.';
    const err        = new Error(message);
    err.status       = res.status;
    err.fieldErrors  = data.errors || null;
    throw err;
  }

  return data;
};

// ── Named API functions ───────────────────────────────────────────────────────

export const authAPI = {
  register: (data)   => apiFetch('/auth/register',  { method: 'POST', body: JSON.stringify(data) }),
  login:    (data)   => apiFetch('/auth/login',      { method: 'POST', body: JSON.stringify(data) }),
  getMe:    ()       => apiFetch('/auth/me'),
};

export const userAPI = {
  getProfile:     ()         => apiFetch('/users/me'),
  updateProfile:  (data)     => apiFetch('/users/me',          { method: 'PUT',    body: JSON.stringify(data) }),
  uploadAvatar:   (formData) => apiFetch('/users/me/avatar',   { method: 'POST',   body: formData }),
  resetAvatar:    ()         => apiFetch('/users/me/avatar',   { method: 'DELETE' }),
  changePassword: (data)     => apiFetch('/users/me/password', { method: 'PUT',    body: JSON.stringify(data) }),
  deleteAccount:  ()         => apiFetch('/users/me',          { method: 'DELETE' }),
};

export default apiFetch;