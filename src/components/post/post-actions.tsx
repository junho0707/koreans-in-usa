'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { ConfirmDialog } from '@/src/components/ui/confirm-dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  postId: number;
  postAuthorId: number;
  initialTitle: string;
  initialBody: string;
};

export function PostActions({ postId, postAuthorId, initialTitle, initialBody }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user || user.id !== postAuthorId) return null;

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body }),
    });
    if (res.ok) {
      setEditing(false);
      router.refresh();
      window.location.reload();
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/');
    }
    setDeleting(false);
    setShowDeleteConfirm(false);
  }

  if (editing) {
    return (
      <div className="mt-4 space-y-3 rounded-lg border p-4 dark:border-gray-700">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 font-semibold dark:border-gray-700 dark:bg-gray-900"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
        />
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !body.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => { setEditing(false); setTitle(initialTitle); setBody(initialBody); }}
            className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-500 hover:text-foreground"
        >
          Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
