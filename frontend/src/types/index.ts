export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  price: number;
  imageUrl: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 