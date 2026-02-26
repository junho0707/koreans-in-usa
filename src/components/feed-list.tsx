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
  authorId?: number;
  authorDisplayName?: string;
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
  const endpointRef = useRef(endpoint);

  // Reset when endpoint changes
  useEffect(() => {
    if (endpointRef.current !== endpoint) {
      endpointRef.current = endpoint;
      setItems([]);
      setCursor(null);
      setHasLoaded(false);
    }
  }, [endpoint]);

  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const url = new URL(endpointRef.current, window.location.origin);
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      setHasLoaded(true);
      setLoading(false);
      return;
    }
    const data = (await response.json()) as FeedResponse;
    if (!data.items) {
      setHasLoaded(true);
      setLoading(false);
      return;
    }
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setHasLoaded(true);
    setLoading(false);
  }, [cursor, loading]);

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
          authorId={item.authorId}
          authorDisplayName={item.authorDisplayName}
        />
      ))}
      <div ref={sentinelRef} />
      {loading && <p className="text-center text-sm text-gray-500">Loading...</p>}
      {!cursor && hasLoaded && items.length === 0 && (
        <p className="text-center text-sm text-gray-500">No posts yet.</p>
      )}
      {!cursor && hasLoaded && items.length > 0 && (
        <p className="text-center text-sm text-gray-400">You&apos;ve reached the end.</p>
      )}
    </div>
  );
}
