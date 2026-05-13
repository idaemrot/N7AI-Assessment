import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool';
import { LoginRequestBody, LoginResponse, UserRow } from '../types';

// ── Login ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 *
 * Returns 200 + { token, role, user } on success.
 * Returns 401 for invalid credentials.
 * Returns 500 for unexpected server errors.
 */
export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  // ── 1. Basic input validation ────────────────────────────────────────────
  if (!email || !password) {
    res.status(401).json({ message: 'Email and password are required' });
    return;
  }

  try {
    // ── 2. Look up user by email ───────────────────────────────────────────
    const result = await pool.query<UserRow>(
      'SELECT id, email, password, role FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    if (!user) {
      // User not found — return same message as wrong password to avoid
      // leaking whether the email exists (timing-safe behaviour).
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // ── 3. Compare password with stored bcrypt hash ────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // ── 4. Sign JWT ────────────────────────────────────────────────────────
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = { id: user.id, email: user.email, role: user.role };

    const token = jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d',
    });

    // ── 5. Return token + role + public user ───────────────────────────────
    const response: LoginResponse = {
      token,
      role: user.role,
      user: { id: user.id, email: user.email, role: user.role },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('[AuthController] login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
