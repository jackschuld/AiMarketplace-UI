export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isAccepted?: boolean;
  userLevel?: UserLevel;
}

export interface UserLevel {
  id: number;
  userId: number;
  user: User | null;
  levelId: number;
  level: Level | null;
  isCompleted: boolean;
  stars: number;
  lastOfferedPrice: number;
  vendorOfferedPrice: number;
  points: number;
  startedAt: string;
  completedAt: string | null;
  chatMessages: Message[];
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  price: number;
  imageUrl: string;
  vendorPersonality: string;
  productDescription: string;
  initialPrice: number;
  targetPrice: number;
  requiredPoints: number;
  userLevels: UserLevel[];
  sellerName: string;
  isStarted: boolean;
  isCompleted: boolean;
  stars: number | null;
  points: number;
  lastOfferedPrice: number | null;
  vendorOfferedPrice: number | null;
  startedAt: string | null;
  completedAt: string | null;
  unreadMessages: number;
  totalMessages: number;
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