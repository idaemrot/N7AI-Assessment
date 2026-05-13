import { Document } from '../../types';

interface DocumentListProps {
  documents: Document[];
  isAdmin: boolean;
  onDelete: (id: number) => void;
  deletingId: number | null;
}

/**
 * Renders a flat list of document cards.
 * Delete button is only rendered when `isAdmin` is true.
 */
export default function DocumentList({
  documents,
  isAdmin,
  onDelete,
  deletingId,
}: DocumentListProps) {
  return (
    <ul className="doc-list">
      {documents.map((doc) => (
        <li key={doc.id} className="doc-card">
          <div className="doc-card-header">
            <div className="doc-card-meta">
              <span className="doc-category">{doc.category}</span>
              <time className="doc-date">
                {new Date(doc.created_at).toLocaleDateString()}
              </time>
            </div>

            {/* Delete button — ADMIN only */}
            {isAdmin && (
              <button
                id={`delete-doc-${doc.id}`}
                className="doc-delete-btn"
                onClick={() => onDelete(doc.id)}
                disabled={deletingId === doc.id}
                aria-label={`Delete document ${doc.title}`}
              >
                {deletingId === doc.id ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>

          <h3 className="doc-title">{doc.title}</h3>
          <p className="doc-content">{doc.content}</p>
        </li>
      ))}
    </ul>
  );
}
