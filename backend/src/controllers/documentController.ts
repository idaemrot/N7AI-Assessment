import { Request, Response } from 'express';
import pool from '../db/pool';
import { DocumentRow } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────

interface CreateDocumentBody {
  title: string;
  content: string;
  category: string;
}

// ── GET /api/documents ─────────────────────────────────────────────────────

/**
 * GET /api/documents
 *
 * Returns all documents ordered by creation date (newest first).
 * Accessible by: ADMIN, USER
 *
 * Responses:
 *   200 – array of documents
 *   500 – unexpected server error
 */
export const getAllDocuments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query<DocumentRow>(
      `SELECT id, title, content, category, created_at
       FROM documents
       ORDER BY created_at DESC`
    );

    res.status(200).json({ documents: result.rows });
  } catch (err) {
    console.error('[DocumentController] getAllDocuments error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /api/documents ────────────────────────────────────────────────────

/**
 * POST /api/documents
 *
 * Creates a new document.
 * Accessible by: ADMIN only
 *
 * Body: { title: string, content: string, category: string }
 *
 * Responses:
 *   201 – created document
 *   400 – missing / empty required fields
 *   500 – unexpected server error
 */
export const createDocument = async (
  req: Request<{}, {}, CreateDocumentBody>,
  res: Response
): Promise<void> => {
  const { title, content, category } = req.body;

  // ── 1. Validate required fields ──────────────────────────────────────────
  const missing: string[] = [];
  if (!title || typeof title !== 'string' || title.trim() === '') missing.push('title');
  if (!content || typeof content !== 'string' || content.trim() === '') missing.push('content');
  if (!category || typeof category !== 'string' || category.trim() === '') missing.push('category');

  if (missing.length > 0) {
    res.status(400).json({
      message: `Missing or empty required fields: ${missing.join(', ')}`,
    });
    return;
  }

  try {
    // ── 2. Insert document ─────────────────────────────────────────────────
    const result = await pool.query<DocumentRow>(
      `INSERT INTO documents (title, content, category)
       VALUES ($1, $2, $3)
       RETURNING id, title, content, category, created_at`,
      [title.trim(), content.trim(), category.trim()]
    );

    res.status(201).json({ document: result.rows[0] });
  } catch (err) {
    console.error('[DocumentController] createDocument error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── DELETE /api/documents/:id ──────────────────────────────────────────────

/**
 * DELETE /api/documents/:id
 *
 * Deletes a document by its primary-key id.
 * Accessible by: ADMIN only
 *
 * Responses:
 *   200 – document deleted successfully
 *   400 – id is not a valid integer
 *   404 – document not found
 *   500 – unexpected server error
 */
export const deleteDocument = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const id = parseInt(req.params.id, 10);

  // ── 1. Validate id param ─────────────────────────────────────────────────
  if (isNaN(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid document id — must be a positive integer' });
    return;
  }

  try {
    // ── 2. Delete and return the deleted row ─────────────────────────────
    const result = await pool.query<DocumentRow>(
      `DELETE FROM documents
       WHERE id = $1
       RETURNING id, title, category`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: `Document with id ${id} not found` });
      return;
    }

    res.status(200).json({
      message: 'Document deleted successfully',
      document: result.rows[0],
    });
  } catch (err) {
    console.error('[DocumentController] deleteDocument error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
