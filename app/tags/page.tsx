'use client';

import { FeedList } from '@/src/components/feed-list';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Tag = {
  id: number;
  slug: string;
  name: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then((data) => {
        setTags(data.tags ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8">Loading tags...</div>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Browse by Topic</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-foreground">
          Back to Feed
        </Link>
      </div>

      {/* Tag cloud */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !selectedTag
              ? 'bg-foreground text-background'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setSelectedTag(tag.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedTag === tag.slug
                ? 'bg-foreground text-background'
                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-sm text-gray-500">No topics available yet.</p>
      )}

      {/* Feed filtered by tag */}
      {selectedTag ? (
        <FeedList endpoint={`/api/feed/usa?topic=${selectedTag}&sort=new&limit=30`} />
      ) : (
        <FeedList endpoint="/api/feed/usa?sort=new&limit=30" />
      )}
    </main>
  );
}
