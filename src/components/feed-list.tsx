'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PostCard } from '@/src/components/post/post-card';

type FeedItem = {
  id: number;
  title: string;
  body: string;
  score: number;
  createdAt: string;
  regionId: string | null;
  type: string;
  commentCount?: number;
  tags?: string[];
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
    <div className="grid gap-3">
      {items.map((item) => (
        <PostCard
          key={item.id}
          id={item.id}
          title={item.title}
          body={item.body}
          type={item.type}
          score={item.score}
          commentCount={item.commentCount}
          regionId={item.regionId}
          tags={item.tags}
          createdAt={item.createdAt}
        />
      ))}
      <div ref={sentinelRef} />
      {loading && <p className="text-center text-sm text-gray-500">Loading...</p>}
      {!cursor && hasLoaded && <p className="text-center text-sm text-gray-500">No more posts.</p>}
    </div>
  );
}
