'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  onClose: () => void;
  defaultRegion?: string;
};

export function PostCreateModal({ onClose, defaultRegion }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [type, setType] = useState<'GENERAL' | 'QA' | 'TIP'>('GENERAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [scopeUsa, setScopeUsa] = useState(!defaultRegion);
  const [scopeRegion, setScopeRegion] = useState(!!defaultRegion);
  const [regionId, setRegionId] = useState(defaultRegion ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        title,
        body,
        scopeUsa,
        scopeRegion,
        regionId: scopeRegion ? regionId : null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      onClose();
      router.push(`/posts/${data.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create post');
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-foreground">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'GENERAL' | 'QA' | 'TIP')}
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="GENERAL">General</option>
              <option value="QA">Q&A</option>
              <option value="TIP">Tip</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
              className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopeUsa}
                onChange={(e) => setScopeUsa(e.target.checked)}
              />
              USA-wide
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scopeRegion}
                onChange={(e) => setScopeRegion(e.target.checked)}
              />
              Region
            </label>
          </div>

          {scopeRegion && (
            <div>
              <label className="mb-1 block text-sm font-medium">Region</label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">Select region</option>
                <option value="NE">Northeast</option>
                <option value="S">South</option>
                <option value="MW">Midwest</option>
                <option value="W">West</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-foreground px-4 py-2 text-background disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Post'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
