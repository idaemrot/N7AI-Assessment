import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  getDocuments,
  createDocument,
  deleteDocument,
  CreateDocumentPayload,
} from '../services/documentService';
import { Document } from '../types';
import DocumentList from '../components/DocumentList';
import CategoryFilter from '../components/CategoryFilter';
import CreateDocumentForm from '../components/CreateDocumentForm';

const ALL = 'All';

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === 'ADMIN';

  // ── Data state ─────────────────────────────────────────────────────────
  const [documents, setDocuments]   = useState<Document[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Filter state ────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL);

  // ── Delete state ────────────────────────────────────────────────────────
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Fetch documents ─────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Token expired / invalid — log out and redirect
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setFetchError(err.response?.data?.message ?? 'Failed to load documents.');
      } else {
        setFetchError('Unexpected error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ── Derived: unique categories from loaded docs ─────────────────────────
  const categories = useMemo(() => {
    const set = new Set(documents.map((d) => d.category));
    return Array.from(set).sort();
  }, [documents]);

  // ── Derived: filtered document list ────────────────────────────────────
  const visibleDocuments = useMemo(() => {
    if (selectedCategory === ALL) return documents;
    return documents.filter((d) => d.category === selectedCategory);
  }, [documents, selectedCategory]);

  // ── Create handler (ADMIN only) ─────────────────────────────────────────
  const handleCreate = useCallback(async (payload: CreateDocumentPayload) => {
    const newDoc = await createDocument(payload);
    // Prepend to list so it appears at the top without a full re-fetch
    setDocuments((prev) => [newDoc, ...prev]);
  }, []);

  // ── Delete handler (ADMIN only) ─────────────────────────────────────────
  const handleDelete = useCallback(async (id: number) => {
    setDeleteError(null);
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      // Reset filter if the deleted doc was the last in the selected category
      setSelectedCategory((prev) => prev);
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 403) {
          setDeleteError('Forbidden: you do not have permission to delete documents.');
        } else if (err.response?.status === 404) {
          setDeleteError('Document not found — it may have already been deleted.');
          // Remove stale entry from local state
          setDocuments((prev) => prev.filter((d) => d.id !== id));
        } else {
          setDeleteError(err.response?.data?.message ?? 'Failed to delete document.');
        }
      } else {
        setDeleteError('Unexpected error. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-wrapper">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">Documents</h1>
          {user && (
            <span className={`role-badge role-badge--${role?.toLowerCase()}`}>
              {role}
            </span>
          )}
        </div>
        <div className="dashboard-header-right">
          {user && (
            <span className="dashboard-email">{user.email}</span>
          )}
          <button
            id="logout-btn"
            className="logout-btn"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-main">

        {/* ── Create form — ADMIN only ──────────────────────────────────── */}
        {isAdmin && (
          <CreateDocumentForm onSuccess={handleCreate} />
        )}

        {/* ── Document section ──────────────────────────────────────────── */}
        <section className="doc-section">

          {/* Delete error banner */}
          {deleteError && (
            <p className="banner banner--error" role="alert">
              {deleteError}
              <button
                className="banner-close"
                onClick={() => setDeleteError(null)}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </p>
          )}

          {/* Section header with doc count */}
          {!isLoading && !fetchError && (
            <div className="doc-section-header">
              <span className="doc-section-title">All Documents</span>
              <span className="doc-count">
                {visibleDocuments.length} of {documents.length}
              </span>
            </div>
          )}

          {/* Category filter — only useful when docs are loaded */}
          {!isLoading && !fetchError && categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={(cat) => setSelectedCategory(cat)}
            />
          )}

          {/* ── Loading state ─────────────────────────────────────────── */}
          {isLoading && (
            <div className="state-well">
              <span className="state-icon">⏳</span>
              <p className="state-msg">Loading documents…</p>
            </div>
          )}

          {/* ── Error state ───────────────────────────────────────────── */}
          {!isLoading && fetchError && (
            <div className="state-well state-error">
              <span className="state-icon">⚠️</span>
              <p className="state-msg">{fetchError}</p>
              <button className="retry-btn" onClick={fetchDocuments}>
                Retry
              </button>
            </div>
          )}

          {/* ── Empty state ───────────────────────────────────────────── */}
          {!isLoading && !fetchError && visibleDocuments.length === 0 && (
            <div className="state-well">
              <span className="state-icon">📄</span>
              <p className="state-msg">
                {selectedCategory === ALL
                  ? 'No documents yet.'
                  : `No documents in "${selectedCategory}".`}
              </p>
              {selectedCategory !== ALL && (
                <p className="state-sub">Try selecting a different category.</p>
              )}
            </div>
          )}

          {/* ── Document list ─────────────────────────────────────────── */}
          {!isLoading && !fetchError && visibleDocuments.length > 0 && (
            <DocumentList
              documents={visibleDocuments}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}
        </section>
      </main>
    </div>
  );
}
