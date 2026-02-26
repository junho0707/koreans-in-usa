'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { EmptyState } from '@/src/components/ui/empty-state';
import { relativeTime } from '@/src/lib/relative-time';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Notification = {
  id: number;
  type: string;
  actorDisplayName: string | null;
  postId: number | null;
  postTitle: string | null;
  isRead: boolean;
  createdAt: string;
};

function notificationMessage(n: Notification): string {
  const actor = n.actorDisplayName ?? 'Someone';
  switch (n.type) {
    case 'COMMENT_ON_POST':
      return `${actor} commented on your post`;
    case 'REPLY_TO_COMMENT':
      return `${actor} replied to your comment`;
    case 'ACCEPTED_ANSWER':
      return `${actor} accepted your answer`;
    case 'NEW_FOLLOWER':
      return `${actor} started following you`;
    case 'DM_RECEIVED':
      return `${actor} sent you a message`;
    default:
      return 'New notification';
  }
}

function notificationLink(n: Notification): string {
  if (n.type === 'DM_RECEIVED') return '/messages';
  if (n.type === 'NEW_FOLLOWER') return '/profile';
  if (n.postId) return `/posts/${n.postId}`;
  return '/notifications';
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items);
        setCursor(data.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function markRead(id: number) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function loadMore() {
    if (!cursor) return;
    fetch(`/api/notifications?cursor=${cursor}`)
      .then((r) => r.json())
      .then((data) => {
        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
      });
  }

  if (authLoading || loading) return <div className="mx-auto max-w-2xl px-4 py-16">Loading...</div>;

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="When someone interacts with your posts or follows you, you'll see it here."
        />
      ) : (
        <div className="space-y-1">
          {items.map((n) => (
            <Link
              key={n.id}
              href={notificationLink(n)}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`block rounded-lg px-4 py-3 transition ${
                n.isRead
                  ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
              }`}
            >
              <p className="text-sm">{notificationMessage(n)}</p>
              {n.postTitle && (
                <p className="mt-0.5 text-xs text-gray-500 truncate">{n.postTitle}</p>
              )}
              <p className="mt-1 text-xs text-gray-400" title={new Date(n.createdAt).toLocaleString()}>
                {relativeTime(n.createdAt)}
              </p>
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
