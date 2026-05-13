import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

/**
 * `protect` middleware
 *
 * Verifies the Bearer JWT on every protected route.
 * Attaches the decoded payload to `req.user` on success.
 *
 * Usage:
 *   router.get('/protected', protect, handler);
 *   router.get('/admin-only', protect, requireRole('ADMIN'), handler);
 */
export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // ── 1. Extract token from Authorization header ───────────────────────────
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // ── 2. Verify & decode ───────────────────────────────────────────────────
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

/**
 * `requireRole` middleware factory
 *
 * Must be used AFTER `protect` (which populates req.user).
 *
 * Usage:
 *   router.delete('/docs/:id', protect, requireRole('ADMIN'), handler);
 */
export const requireRole = (...roles: JwtPayload['role'][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden: insufficient role' });
      return;
    }

    next();
  };
};
