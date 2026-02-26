'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { EmptyState } from '@/src/components/ui/empty-state';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type BookmarkedPost = {
  id: number;
  postId: number;
  title: string;
  type: string;
  authorDisplayName: string;
  score: number;
  commentCount: number;
  createdAt: string;
  bookmarkedAt: string;
};

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<BookmarkedPost[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  function loadMore() {
    if (!cursor) return;
    fetch(`/api/bookmarks?cursor=${cursor}`)
      .then((r) => r.json())
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
      });
  }

  if (authLoading || loading) {
    return <div className="mx-auto max-w-2xl px-4 py-16">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Saved Posts</h1>

      {items.length === 0 ? (
        <EmptyState
          title="No saved posts"
          description="Bookmark posts you want to read later. They'll appear here."
          actionLabel="Browse feed"
          actionHref="/"
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/posts/${item.postId}`}
              className="block rounded-lg border p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">{item.type}</span>
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-gray-500">
                <span>{item.authorDisplayName}</span>
                <span>{item.score} votes</span>
                <span>{item.commentCount} comments</span>
                <span>Saved {new Date(item.bookmarkedAt).toLocaleDateString()}</span>
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
