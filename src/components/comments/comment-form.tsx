'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { MentionInput } from '@/src/components/comments/mention-input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  postId: number;
  parentCommentId?: number | null;
  onSubmitted?: () => void;
  onCancel?: () => void;
};

export function CommentForm({ postId, parentCommentId, onSubmitted, onCancel }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="text-sm text-blue-600 hover:underline"
      >
        Sign in to comment
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError('');

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, parentCommentId, body }),
    });

    if (res.ok) {
      setBody('');
      onSubmitted?.();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to post comment');
    }
    setSaving(false);
  }

  const MAX_COMMENT = 5000;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <MentionInput
        value={body}
        onChange={(v) => v.length <= MAX_COMMENT && setBody(v)}
        placeholder={parentCommentId ? 'Write a reply... (type @ to mention)' : 'Write a comment... (type @ to mention)'}
        rows={3}
        className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !body.trim() || body.length > MAX_COMMENT}
            className="rounded-lg bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
          >
            {saving ? 'Posting...' : parentCommentId ? 'Reply' : 'Comment'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:text-foreground"
            >
              Cancel
            </button>
          )}
        </div>
        {body.length > 0 && (
          <span className={`text-xs ${body.length > MAX_COMMENT * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
            {body.length}/{MAX_COMMENT}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
