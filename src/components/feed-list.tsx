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

export function FeedList({ endpoint }: { endpoint: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const url = new URL(endpoint, window.location.origin);
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const response = await fetch(url.toString());
    const data = (await response.json()) as FeedResponse;
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setHasLoaded(true);
    setLoading(false);
  }, [cursor, endpoint, loading]);

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
      if (entry.isIntersecting && cursor) {
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
      <div ref={sentinelRef} />
      {loading && <p>Loading...</p>}
      {!cursor && hasLoaded && <p>No more posts.</p>}
    </div>
  );
}
