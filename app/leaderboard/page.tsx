'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar } from '@/src/components/ui/avatar';
import { EmptyState } from '@/src/components/ui/empty-state';

type LeaderboardUser = {
  id: number;
  displayName: string;
  reputation: number;
  postCount: number;
  commentCount: number;
};

type Period = 'all' | 'month' | 'week';

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'month', label: 'This Month' },
  { value: 'week', label: 'This Week' },
];

const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

export default function LeaderboardPage() {
  const [items, setItems] = useState<LeaderboardUser[]>([]);
  const [period, setPeriod] = useState<Period>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                period === opt.value
                  ? 'bg-foreground text-background'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No users yet"
          description="Be the first to contribute and earn reputation!"
          actionLabel="Browse feed"
          actionHref="/"
        />
      ) : (
        <div className="space-y-1">
          {items.map((user, idx) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <span className="w-8 text-center">
                {idx < 3 ? (
                  <span className={`text-lg font-bold ${MEDAL_COLORS[idx]}`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">{idx + 1}</span>
                )}
              </span>
              <Avatar name={user.displayName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{user.displayName}</p>
                <p className="text-xs text-gray-500">
                  {user.postCount} posts · {user.commentCount} comments
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{user.reputation.toLocaleString()}</p>
                <p className="text-xs text-gray-500">rep</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
