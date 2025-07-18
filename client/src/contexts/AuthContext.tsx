/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../services/api';
import type { User, AuthContextType } from '../types';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = Cookies.get('token');
      
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await authApi.checkAuth();
          setUser(response.user);
        } catch {
          // Token is invalid, remove it
          Cookies.remove('token');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      setUser(response.user);
      setToken(response.token);
      
      // Store token in cookie (expires in 7 days)
      Cookies.set('token', response.token, { expires: 7 });
      
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error: unknown) {
      const message = (error as any)?.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name });
      
      setUser(response.user);
      setToken(response.token);
      
      // Store token in cookie (expires in 7 days)
      Cookies.set('token', response.token, { expires: 7 });
      
      toast.success(`Welcome to Canteen Management, ${response.user.name}!`);
    } catch (error: unknown) {
      const message = (error as any)?.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Even if API call fails, we should still logout locally
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      Cookies.remove('token');
      toast.success('Logged out successfully');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
