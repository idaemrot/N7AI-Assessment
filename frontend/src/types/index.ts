// Shared TypeScript types for the frontend

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}
