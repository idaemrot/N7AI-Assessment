// Shared TypeScript types for the backend

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface Document {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
}

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
