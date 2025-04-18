import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { api } from '../services/api';  // Import your api service

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token: token || null,
      isAuthenticated: Boolean(token && storedUser),
    };
  });

  // Validate token on mount and after token changes
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        return; // Don't logout if there's no token, just don't set authenticated state
      }

      try {
        // Add an endpoint to validate the token or use an existing endpoint
        const response = await api.auth.validateToken(token);
        if (response.success) {
          // Token is valid, ensure auth state is set correctly
          setAuthState({
            user: JSON.parse(storedUser),
            token,
            isAuthenticated: true,
          });
        } else {
          // Only logout if token validation explicitly fails
          logout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        // Only logout if it's an auth error, not a network error
        if ((error as any).response?.status === 401) {
          logout();
        }
      }
    };

    validateToken();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 