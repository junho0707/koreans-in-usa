'use client';

import { useEffect, useState } from 'react';
import { NewsCard } from '@/src/components/news/news-card';

type NewsItem = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
};

type Props = {
  endpoint?: string;
};

export function NewsSection({ endpoint = '/api/news?limit=5' }: Props) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return <div className="text-sm text-gray-500">Loading news...</div>;
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold">News</h2>
      {items.map((item) => (
        <NewsCard key={item.id} {...item} />
      ))}
    </section>
  );
}
