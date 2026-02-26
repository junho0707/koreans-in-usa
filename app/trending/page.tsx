'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar } from '@/src/components/ui/avatar';
import { EmptyState } from '@/src/components/ui/empty-state';
import { relativeTime } from '@/src/lib/relative-time';

type TrendingItem = {
  id: number;
  title: string;
  bodySnippet: string;
  type: string;
  authorDisplayName: string;
  regionId: string | null;
  score: number;
  commentCount: number;
  trendingScore: number;
  createdAt: string;
};

const TYPE_COLORS: Record<string, string> = {
  QA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TIP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  GENERAL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function TrendingPage() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trending')
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, []);

  function loadMore() {
    if (!cursor) return;
    fetch(`/api/trending?cursor=${cursor}`)
      .then((r) => r.json())
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
      });
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-16">Loading...</div>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trending</h1>
          <p className="mt-1 text-sm text-gray-500">Most engaged posts from the past week</p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-foreground">
          Back to feed
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No trending posts"
          description="When posts get lots of votes and comments, they'll appear here."
          actionLabel="Browse feed"
          actionHref="/"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <Link
              key={item.id}
              href={`/posts/${item.id}`}
              className="flex gap-4 rounded-lg border p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold dark:bg-gray-800">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${TYPE_COLORS[item.type] ?? TYPE_COLORS.GENERAL}`}>
                    {item.type}
                  </span>
                  <h3 className="truncate font-medium">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.bodySnippet}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Avatar name={item.authorDisplayName} size="sm" />
                    {item.authorDisplayName}
                  </span>
                  <span>{item.score} votes</span>
                  <span>{item.commentCount} comments</span>
                  <span title={new Date(item.createdAt).toLocaleString()}>{relativeTime(item.createdAt)}</span>
                  {item.regionId && <span>{item.regionId}</span>}
                </div>
              </div>
            </Link>
          ))}
          {cursor && (
            <button onClick={loadMore} className="w-full rounded-lg border py-2 text-sm hover:bg-gray-50 dark:border-gray-700">
              Load more
            </button>
          )}
        </div>
      )}
    </main>
  );
}
