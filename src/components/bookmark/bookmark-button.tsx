'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/components/providers/auth-context';

export function BookmarkButton({ postId }: { postId: number }) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/bookmarks/check?postId=${postId}`)
      .then((r) => r.json())
      .then((data) => setBookmarked(data.bookmarked))
      .catch(() => {});
  }, [user, postId]);

  if (!user) return null;

  async function handleToggle() {
    setLoading(true);
    setBookmarked(!bookmarked);
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } catch {
      setBookmarked(bookmarked);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-foreground disabled:opacity-50"
      title={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
    >
      <svg
        className="h-5 w-5"
        fill={bookmarked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      <span>{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  );
}
