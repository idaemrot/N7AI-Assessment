import { useState, FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { CreateDocumentPayload } from '../../services/documentService';

interface CreateDocumentFormProps {
  onSuccess: (payload: CreateDocumentPayload) => Promise<void>;
}

const EMPTY: CreateDocumentPayload = { title: '', content: '', category: '' };

/**
 * Create Document form — rendered ONLY for ADMIN users (caller's responsibility).
 * Validates all three required fields before submitting.
 * Delegates the actual API call to the parent via `onSuccess` so the parent
 * can update its document list state.
 */
export default function CreateDocumentForm({ onSuccess }: CreateDocumentFormProps) {
  const [fields, setFields] = useState<CreateDocumentPayload>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof CreateDocumentPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // ── Client-side validation ─────────────────────────────────────────────
    const missing = (
      Object.entries(fields) as [keyof CreateDocumentPayload, string][]
    )
      .filter(([, v]) => !v.trim())
      .map(([k]) => k);

    if (missing.length > 0) {
      setError(`Required: ${missing.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSuccess({
        title: fields.title.trim(),
        content: fields.content.trim(),
        category: fields.category.trim(),
      });
      setFields(EMPTY);
      setSuccess(true);
      // Clear success banner after 3 s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create document. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-form-wrapper">
      <h2 className="create-form-title">New Document</h2>

      <form id="create-document-form" className="create-form" onSubmit={handleSubmit} noValidate>
        <div className="create-form-row">
          <div className="form-group">
            <label htmlFor="doc-title">Title</label>
            <input
              id="doc-title"
              type="text"
              placeholder="Document title"
              value={fields.title}
              onChange={set('title')}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="doc-category">Category</label>
            <input
              id="doc-category"
              type="text"
              placeholder="e.g. Finance, HR"
              value={fields.category}
              onChange={set('category')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="doc-content">Content</label>
          <textarea
            id="doc-content"
            className="form-textarea"
            rows={4}
            placeholder="Document content…"
            value={fields.content}
            onChange={set('content')}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">{error}</p>
        )}
        {success && (
          <p className="form-success" role="status">Document created successfully.</p>
        )}

        <button
          id="create-doc-submit"
          type="submit"
          className="create-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating…' : 'Create Document'}
        </button>
      </form>
    </div>
  );
}
