'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type FeedItem = {
  id: number;
  title: string;
  body: string;
  score: number;
  createdAt: string;
  regionId: string | null;
  type: string;
};

type FeedResponse = {
  items: FeedItem[];
  nextCursor: string | null;
};

function mergeById(prev: FeedItem[], incoming: FeedItem[]): FeedItem[] {
  const map = new Map<number, FeedItem>();
  for (const item of prev) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return [...map.values()];
}

export function FeedList({ endpoint }: { endpoint: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const url = new URL(endpoint, window.location.origin);
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Feed request failed (${response.status})`);
      }

      const data = (await response.json()) as FeedResponse;
      setItems((prev) => mergeById(prev, data.items));
      setCursor(data.nextCursor);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown feed error');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [cursor, endpoint]);

  useEffect(() => {
    if (hasLoaded) return;
    const handle = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(handle);
  }, [hasLoaded, load]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && cursor && !loadingRef.current) {
        void load();
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, load]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((item) => (
        <article key={item.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          <small>
            {item.type} · score {item.score} · {new Date(item.createdAt).toLocaleString()}
            {item.regionId ? ` · ${item.regionId}` : ''}
          </small>
        </article>
      ))}

      {error && <p role="alert">{error}</p>}
      <div ref={sentinelRef} />
      {loading && <p>Loading...</p>}
      {!cursor && hasLoaded && !loading && <p>No more posts.</p>}
    </div>
  );
}
