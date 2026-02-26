'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type PinnedPost = {
  id: number;
  title: string;
  type: string;
  authorDisplayName: string;
  score: number;
  commentCount: number;
};

export function PinnedPosts() {
  const [items, setItems] = useState<PinnedPost[]>([]);

  useEffect(() => {
    fetch('/api/feed/pinned')
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/posts/${item.id}`}
          className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 transition hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
        >
          <svg className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium dark:bg-yellow-800">{item.type}</span>
          <span className="truncate text-sm font-medium">{item.title}</span>
          <span className="ml-auto shrink-0 text-xs text-gray-500">{item.score} votes</span>
        </Link>
      ))}
    </div>
  );
}
