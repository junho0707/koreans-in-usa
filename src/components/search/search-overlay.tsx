'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Avatar } from '@/src/components/ui/avatar';
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

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'QA', label: 'Q&A' },
  { value: 'TIP', label: 'Tips' },
];

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  defaultRegion?: string;
};

export function SearchOverlay({ open, onClose, defaultRegion }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setType('');
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const doSearch = useCallback(async (q: string, t: string, cursor?: number) => {
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (t) params.set('type', t);
      if (defaultRegion) params.set('region', defaultRegion);
      if (cursor) params.set('cursor', String(cursor));

      const res = await fetch(`/api/search?${params}`);
      const data: SearchResult = await res.json();

      if (cursor && results) {
        setResults({ ...data, items: [...results.items, ...data.items] });
      } else {
        setResults(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [defaultRegion, results]);

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        doSearch(query, type);
      } else {
        setResults(null);
      }
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 rounded-lg border px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {/* Type filter chips */}
        <div className="mb-4 flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setType(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                type === f.value
                  ? 'bg-foreground text-background'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading && !results && (
          <p className="mt-8 text-center text-sm text-gray-500">Searching...</p>
        )}

        {results && (
          <div className="mt-2">
            <p className="mb-3 text-sm text-gray-500">
              {results.total} result{results.total !== 1 ? 's' : ''}
            </p>

            {results.items.length === 0 ? (
              <p className="mt-8 text-center text-sm text-gray-500">No results found. Try different keywords.</p>
            ) : (
              <div className="space-y-3">
                {results.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/posts/${item.id}`}
                    onClick={onClose}
                    className="block rounded-lg border p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-800">
                        {item.type}
                      </span>
                      <h3 className="truncate text-sm font-medium">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.bodySnippet}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Avatar name={item.authorDisplayName} size="sm" />
                        {item.authorDisplayName}
                      </span>
                      <span>&middot;</span>
                      <span>{item.score} votes</span>
                      <span>&middot;</span>
                      <span>{item.commentCount} comments</span>
                      <span>&middot;</span>
                      <span>{relativeTime(item.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {results.nextCursor && (
              <button
                onClick={() => doSearch(query, type, results.nextCursor!)}
                disabled={loading}
                className="mt-4 w-full rounded-lg border py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            )}
          </div>
        )}

        {!results && !loading && query.length === 0 && (
          <p className="mt-12 text-center text-sm text-gray-400">Type at least 2 characters to search</p>
        )}
      </div>
    </div>
  );
}
