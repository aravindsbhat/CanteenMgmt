// Types for the Canteen Management System

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: number;
  prepTime: number;
  image?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  menuItem?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  items?: OrderItem[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: number;
  prepTime: number;
  image?: string;
  quantity: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface OrderRequest {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}
