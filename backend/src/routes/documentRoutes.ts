import { Router } from 'express';
import { protect, requireRole } from '../middleware/authMiddleware';
import {
  getAllDocuments,
  createDocument,
  deleteDocument,
} from '../controllers/documentController';

const router = Router();

// ── GET /api/documents ─────────────────────────────────────────────────────
// Accessible by: ADMIN, USER
router.get(
  '/',
  protect,
  requireRole('ADMIN', 'USER'),
  getAllDocuments
);

// ── POST /api/documents ────────────────────────────────────────────────────
// Accessible by: ADMIN only
router.post(
  '/',
  protect,
  requireRole('ADMIN'),
  createDocument
);

// ── DELETE /api/documents/:id ──────────────────────────────────────────────
// Accessible by: ADMIN only
router.delete(
  '/:id',
  protect,
  requireRole('ADMIN'),
  deleteDocument
);

export default router;
