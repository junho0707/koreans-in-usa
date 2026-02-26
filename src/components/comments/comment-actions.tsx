'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import { useState } from 'react';

type Props = {
  commentId: number;
  authorId: number;
  initialBody: string;
  onUpdated?: () => void;
};

export function CommentActions({ commentId, authorId, initialBody, onUpdated }: Props) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user || user.id !== authorId) return null;

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      setEditing(false);
      onUpdated?.();
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (res.ok) {
      onUpdated?.();
    }
    setDeleting(false);
    setShowDelete(false);
  }

  if (editing) {
    return (
      <div className="mt-2 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !body.trim()}
            className="rounded px-3 py-1 text-xs bg-foreground text-background disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => { setEditing(false); setBody(initialBody); }}
            className="rounded px-3 py-1 text-xs border dark:border-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-gray-500 hover:text-foreground"
      >
        Edit
      </button>
      <button
        onClick={() => setShowDelete(true)}
        className="text-xs text-red-500 hover:text-red-700"
      >
        Delete
      </button>
      <ConfirmDialog
        open={showDelete}
        title="Delete comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
