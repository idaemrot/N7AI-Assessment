// ── Database row shapes ────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'USER';

/** Mirrors the `users` table row returned from pg queries. */
export interface UserRow {
  id: number;
  email: string;
  password: string; // bcrypt hash — never expose in responses
  role: UserRole;
  created_at: Date;
}

/** Safe user object (password stripped) returned in API responses. */
export interface UserPublic {
  id: number;
  email: string;
  role: UserRole;
}

/** Mirrors the `documents` table row. */
export interface DocumentRow {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: Date;
}

// ── JWT ────────────────────────────────────────────────────────────────────

/** Shape of the payload encoded into every JWT token. */
export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  user: UserPublic;
}

// ── Extend Express Request ─────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      /** Set by `protect` middleware after successful JWT verification. */
      user?: JwtPayload;
    }
  }
}
