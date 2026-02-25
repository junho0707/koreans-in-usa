'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type ReportedItem = {
  targetType: 'POST' | 'COMMENT';
  targetId: number;
  reportCount: number;
  isHidden: boolean;
  content: string;
  authorDisplayName: string;
};

export default function ModerationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<ReportedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    fetch('/api/admin/moderation')
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      loadItems();
    }
  }, [authLoading, user, router, loadItems]);

  async function handleAction(action: 'hide' | 'unhide', targetType: string, targetId: number) {
    await fetch('/api/admin/moderation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, targetType, targetId }),
    });
    loadItems();
  }

  if (authLoading || loading) {
    return <div className="mx-auto max-w-4xl px-4 py-8">Loading...</div>;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Moderation Panel</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">No reported content.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.targetType}-${item.targetId}`}
              className={`rounded-lg border p-4 ${
                item.isHidden
                  ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-sm">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                  {item.targetType}
                </span>
                <span>#{item.targetId}</span>
                <span className="text-red-600">{item.reportCount} reports</span>
                <span className="text-gray-500">by {item.authorDisplayName}</span>
                {item.isHidden && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
                    Hidden
                  </span>
                )}
              </div>
              <p className="mb-3 text-sm">{item.content}</p>
              <div className="flex gap-2">
                {item.isHidden ? (
                  <button
                    onClick={() => handleAction('unhide', item.targetType, item.targetId)}
                    className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                  >
                    Unhide
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('hide', item.targetType, item.targetId)}
                    className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                  >
                    Hide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
