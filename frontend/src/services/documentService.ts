import api from './api';
import { Document } from '../types';

// ── Response shapes ────────────────────────────────────────────────────────

interface GetDocumentsResponse {
  documents: Document[];
}

interface SingleDocumentResponse {
  document: Document;
}

interface DeleteDocumentResponse {
  message: string;
  document: Pick<Document, 'id' | 'title' | 'category'>;
}

export interface CreateDocumentPayload {
  title: string;
  content: string;
  category: string;
}

// ── GET /api/documents ─────────────────────────────────────────────────────

/**
 * Fetch all documents. JWT is attached automatically by the axios interceptor.
 * Returns the documents array on success.
 */
export async function getDocuments(): Promise<Document[]> {
  const { data } = await api.get<GetDocumentsResponse>('/documents');
  return data.documents;
}

// ── POST /api/documents ────────────────────────────────────────────────────

/**
 * Create a new document (ADMIN only).
 * Returns the created document on success.
 * Throws AxiosError with status 403 if called by a USER role.
 */
export async function createDocument(
  payload: CreateDocumentPayload
): Promise<Document> {
  const { data } = await api.post<SingleDocumentResponse>('/documents', payload);
  return data.document;
}

// ── DELETE /api/documents/:id ──────────────────────────────────────────────

/**
 * Delete a document by id (ADMIN only).
 * Returns the deleted document summary on success.
 * Throws AxiosError with status 403 if called by a USER role.
 * Throws AxiosError with status 404 if document does not exist.
 */
export async function deleteDocument(id: number): Promise<DeleteDocumentResponse> {
  const { data } = await api.delete<DeleteDocumentResponse>(`/documents/${id}`);
  return data;
}
