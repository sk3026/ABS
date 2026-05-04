import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
};

export const accountApi = {
  createAccount: (data) => client.post('/accounts', data),
  getAccounts: () => client.get('/accounts'),
  getAccount: (id) => client.get(`/accounts/${id}`),
};

export const transactionApi = {
  transfer: (data, idempotencyKey) =>
    client.post('/transactions/transfer', data, {
      headers: { 'idempotency-key': idempotencyKey },
    }),
  getBalance: (accountId) => client.get(`/transactions/${accountId}/balance`),
  getHistory: (accountId, limit = 50, skip = 0) =>
    client.get(`/transactions/${accountId}/history`, {
      params: { limit, skip },
    }),
};

export default client;
