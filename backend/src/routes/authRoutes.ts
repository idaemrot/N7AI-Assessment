import { Router } from 'express';
import { login } from '../controllers/authController';

const router = Router();

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
router.post('/login', login);

export default router;
