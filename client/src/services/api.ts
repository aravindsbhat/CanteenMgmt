/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import Cookies from 'js-cookie';
import type { 
  MenuItem, 
  Order, 
  User, 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  OrderRequest 
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config: any) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  checkAuth: async (): Promise<{ authenticated: boolean; user: User }> => {
    const response = await api.get('/auth/check');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },

  updateProfile: async (userData: { name?: string; email?: string }) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// Menu API
export const menuApi = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get('/menu');
    return response.data;
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  getMenuByCategory: async (category: string): Promise<MenuItem[]> => {
    const response = await api.get(`/menu/category/${category}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  updateAvailability: async (id: string, available: number): Promise<MenuItem> => {
    const response = await api.put(`/menu/${id}/availability`, { available });
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  placeOrder: async (orderData: OrderRequest): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export default api;
