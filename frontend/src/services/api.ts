import { ApiResponse, User, Level, Message } from '../types';

console.log('API URL from env:', process.env.REACT_APP_API_URL);
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5107/api';
console.log('Final API_BASE_URL:', API_BASE_URL);

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Auth/login`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Login failed' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Failed to login' };
      }
    },

    register: async (username: string, email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Auth/register`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ username, email, password }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Registration failed' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to register' };
      }
    },
  },

  levels: {
    getAll: async (token: string): Promise<ApiResponse<Level[]>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Game/levels`, {
          headers: getHeaders(token),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch levels' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to fetch levels' };
      }
    },

    getById: async (id: string, token: string): Promise<ApiResponse<Level>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Game/levels/${id}`, {
          headers: getHeaders(token),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch level' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to fetch level' };
      }
    },
  },

  messages: {
    getConversations: async (token: string): Promise<ApiResponse<Message[]>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Game/levels`, {
          headers: getHeaders(token),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch conversations' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to fetch conversations' };
      }
    },

    getMessages: async (conversationId: string, token: string): Promise<ApiResponse<Message[]>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Game/levels/${conversationId}/messages`, {
          headers: getHeaders(token),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Failed to fetch messages' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to fetch messages' };
      }
    },

    sendMessage: async (conversationId: string, content: string, token: string): Promise<ApiResponse<Message>> => {
      try {
        const response = await fetch(`${API_BASE_URL}/Game/levels/${conversationId}/messages`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify({ content }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          return { success: false, error: 'Failed to send message' };
        }
        
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to send message' };
      }
    },
  },
}; 