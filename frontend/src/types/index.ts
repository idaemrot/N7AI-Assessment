// ── Shared TypeScript types for the frontend ───────────────────────────────

export type UserRole = 'ADMIN' | 'USER';

/** Public user shape returned by the API (no password). */
export interface User {
  id: number;
  email: string;
  role: UserRole;
}

/** Document shape returned by the API. */
export interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

/** Shape of a successful POST /api/auth/login response. */
export interface AuthResponse {
  token: string;
  role: UserRole;
  user: User;
}

/** Generic API error shape. */
export interface ApiError {
  message: string;
}

/** Login form fields. */
export interface LoginCredentials {
  email: string;
  password: string;
}
