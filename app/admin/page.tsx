'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Stats = {
  total_users: number;
  total_posts: number;
  total_comments: number;
  total_votes: number;
  total_reports: number;
  hidden_posts: number;
  new_users_7d: number;
  new_posts_7d: number;
  new_comments_7d: number;
};

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then(setStats)
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) return <div className="mx-auto max-w-4xl px-4 py-8">Loading...</div>;
  if (!stats) return <div className="mx-auto max-w-4xl px-4 py-8">Failed to load stats.</div>;

  const statCards = [
    { label: 'Total Users', value: stats.total_users, color: 'bg-blue-100 dark:bg-blue-900' },
    { label: 'Total Posts', value: stats.total_posts, color: 'bg-green-100 dark:bg-green-900' },
    { label: 'Total Comments', value: stats.total_comments, color: 'bg-purple-100 dark:bg-purple-900' },
    { label: 'Total Votes', value: stats.total_votes, color: 'bg-yellow-100 dark:bg-yellow-900' },
    { label: 'Reports', value: stats.total_reports, color: 'bg-red-100 dark:bg-red-900' },
    { label: 'Hidden Posts', value: stats.hidden_posts, color: 'bg-orange-100 dark:bg-orange-900' },
  ];

  const weeklyCards = [
    { label: 'New Users (7d)', value: stats.new_users_7d },
    { label: 'New Posts (7d)', value: stats.new_posts_7d },
    { label: 'New Comments (7d)', value: stats.new_comments_7d },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link
          href="/admin/moderation"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
        >
          Moderation Panel
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Overview</h2>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-lg p-4 ${card.color}`}>
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">This Week</h2>
      <div className="grid grid-cols-3 gap-4">
        {weeklyCards.map((card) => (
          <div key={card.label} className="rounded-lg border p-4 dark:border-gray-700">
            <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
