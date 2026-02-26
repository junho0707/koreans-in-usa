'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Announcement = {
  id: number;
  title: string;
  body: string;
  type: string;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export default function AdminAnnouncementsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success'>('info');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetch('/api/admin/announcements')
        .then((r) => r.json())
        .then((data) => setItems(data.items ?? []))
        .finally(() => setLoading(false));
    }
  }, [authLoading, user, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, type }),
    });
    if (res.ok) {
      setTitle('');
      setBody('');
      // Reload list
      const data = await fetch('/api/admin/announcements').then((r) => r.json());
      setItems(data.items ?? []);
    }
    setCreating(false);
  }

  if (authLoading || loading) return <div className="mx-auto max-w-3xl px-4 py-8">Loading...</div>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Announcements</h1>

      <form onSubmit={handleCreate} className="mb-8 space-y-3 rounded-lg border p-4 dark:border-gray-700">
        <h3 className="font-medium">Create Announcement</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body (optional)"
          rows={2}
          className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <div className="flex items-center gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'info' | 'warning' | 'success')}
            className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{item.title}</h4>
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${item.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="rounded px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800">{item.type}</span>
              </div>
            </div>
            {item.body && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.body}</p>}
            <p className="mt-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
