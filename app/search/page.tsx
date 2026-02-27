'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TagBadge } from '@/src/components/tags/tag-badge';
import { Avatar } from '@/src/components/ui/avatar';
import { EmptyState } from '@/src/components/ui/empty-state';
import { relativeTime } from '@/src/lib/relative-time';

type SearchItem = {
  id: number;
  title: string;
  bodySnippet: string;
  type: string;
  authorDisplayName: string;
  regionId: string | null;
  score: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
};

type SearchResult = {
  items: SearchItem[];
  nextCursor: number | null;
  total: number;
};

const REGIONS = [
  { value: '', label: 'All Regions' },
  { value: 'NE', label: 'Northeast' },
  { value: 'S', label: 'South' },
  { value: 'MW', label: 'Midwest' },
  { value: 'W', label: 'West' },
];

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'QA', label: 'Q&A' },
  { value: 'TIP', label: 'Tips' },
  { value: 'GENERAL', label: 'General' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string, t: string, r: string, cursor?: number) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (t) params.set('type', t);
      if (r) params.set('region', r);
      if (cursor) params.set('cursor', String(cursor));

      const res = await fetch(`/api/search?${params}`);
      const data: SearchResult = await res.json();

      if (cursor && results) {
        setResults({
          ...data,
          items: [...results.items, ...data.items],
        });
      } else {
        setResults(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [results]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        doSearch(query, type, region);
      } else {
        setResults(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, region]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>

      <div className="space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts..."
          className="w-full rounded-lg border px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          autoFocus
        />

        <div className="flex gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && !results && (
        <p className="mt-8 text-sm text-gray-500">Searching...</p>
      )}

      {results && (
        <div className="mt-6">
          <p className="mb-4 text-sm text-gray-500">
            {results.total} result{results.total !== 1 ? 's' : ''}
          </p>

          {results.items.length === 0 ? (
            <EmptyState
              title="No results found"
              description="Try different keywords or adjust your filters."
            />
          ) : (
            <div className="space-y-4">
              {results.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/posts/${item.id}`}
                  className="block rounded-lg border p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-800">
                          {item.type}
                        </span>
                        <h3 className="truncate font-medium">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.bodySnippet}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Avatar name={item.authorDisplayName} size="sm" />
                          {item.authorDisplayName}
                        </span>
                        <span>&middot;</span>
                        <span>{item.score} votes</span>
                        <span>&middot;</span>
                        <span>{item.commentCount} comments</span>
                        <span>&middot;</span>
                        <span title={new Date(item.createdAt).toLocaleString()}>{relativeTime(item.createdAt)}</span>
                        {item.regionId && (
                          <>
                            <span>&middot;</span>
                            <span>{item.regionId}</span>
                          </>
                        )}
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {results.nextCursor && (
            <button
              onClick={() => doSearch(query, type, region, results.nextCursor!)}
              disabled={loading}
              className="mt-4 w-full rounded-lg border py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
