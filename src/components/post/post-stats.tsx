'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { relativeTime } from '@/src/lib/relative-time';
import { useEffect, useState } from 'react';

type Stats = {
  createdAt: string;
  voteCount: number;
  commentCount: number;
  bookmarkCount: number;
  votes24h: number;
  comments24h: number;
};

export function PostStats({ postId, postAuthorId }: { postId: number; postAuthorId: number }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user || user.id !== postAuthorId) return;
    fetch(`/api/posts/${postId}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, [user, postId, postAuthorId]);

  if (!stats || !user || user.id !== postAuthorId) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-gray-500 hover:text-foreground"
      >
        {expanded ? 'Hide stats' : 'View stats'}
      </button>
      {expanded && (
        <div className="mt-2 grid grid-cols-2 gap-3 rounded-lg border p-4 text-sm dark:border-gray-700 sm:grid-cols-4">
          <div>
            <p className="text-2xl font-bold">{stats.voteCount}</p>
            <p className="text-xs text-gray-500">Total votes</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.commentCount}</p>
            <p className="text-xs text-gray-500">Comments</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.bookmarkCount}</p>
            <p className="text-xs text-gray-500">Bookmarks</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mt-1">Last 24h</p>
            <p className="text-sm">+{stats.votes24h} votes, +{stats.comments24h} comments</p>
          </div>
        </div>
      )}
    </div>
  );
}
