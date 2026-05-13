import { useState, useEffect, useRef } from 'react';
import { Document } from '../../types';

interface DocumentListProps {
  documents: Document[];
  isAdmin: boolean;
  onDelete: (id: number) => void;
  deletingId: number | null;
}

export default function DocumentList({
  documents,
  isAdmin,
  onDelete,
  deletingId,
}: DocumentListProps) {
  const [expandedIds,   setExpandedIds]   = useState<Set<number>>(new Set());
  const [overflowIds,   setOverflowIds]   = useState<Set<number>>(new Set());
  const [confirmingId,  setConfirmingId]  = useState<number | null>(null);

  // Map of content element refs keyed by document id
  const contentRefs = useRef<Map<number, HTMLParagraphElement>>(new Map());

  // After every document list change, check which cards actually overflow
  useEffect(() => {
    const overflowing = new Set<number>();
    contentRefs.current.forEach((el, id) => {
      if (el && el.scrollHeight > el.clientHeight + 1) {
        overflowing.add(id);
      }
    });
    setOverflowIds(overflowing);
  }, [documents]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setRef = (id: number) => (el: HTMLParagraphElement | null) => {
    if (el) contentRefs.current.set(id, el);
    else contentRefs.current.delete(id);
  };

  return (
    <ul className="doc-list">
      {documents.map((doc) => {
        const isExpanded = expandedIds.has(doc.id);
        const hasOverflow = overflowIds.has(doc.id);

        return (
          <li key={doc.id} className="doc-card">
            <div className="doc-card-header">
              <div className="doc-card-meta">
                <span className="doc-category">{doc.category}</span>
                <time className="doc-date">
                  {new Date(doc.created_at).toLocaleDateString()}
                </time>
              </div>

              {isAdmin && (
                confirmingId === doc.id ? (
                  <span className="doc-confirm-row">
                    <span className="doc-confirm-label">Delete?</span>
                    <button
                      className="doc-confirm-cancel"
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="doc-confirm-yes"
                      onClick={() => { setConfirmingId(null); onDelete(doc.id); }}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? 'Deleting…' : 'Yes'}
                    </button>
                  </span>
                ) : (
                  <button
                    id={`delete-doc-${doc.id}`}
                    className="doc-delete-btn"
                    onClick={() => setConfirmingId(doc.id)}
                    disabled={deletingId === doc.id}
                    aria-label={`Delete document ${doc.title}`}
                  >
                    Delete
                  </button>
                )
              )}
            </div>

            <h3 className="doc-title">{doc.title}</h3>

            <p
              ref={setRef(doc.id)}
              className={`doc-content${isExpanded ? ' doc-content--expanded' : ''}`}
            >
              {doc.content}
            </p>

            {/* Only render toggle if content actually overflows */}
            {hasOverflow && (
              <button
                className="doc-expand-btn"
                onClick={() => toggleExpand(doc.id)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Show less ↑' : 'Show more ↓'}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
