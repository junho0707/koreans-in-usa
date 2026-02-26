'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Tag = {
  id: number;
  slug: string;
  name: string;
};

export function PopularTags() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch('/api/tags')
      .then((r) => r.json())
      .then((data) => setTags((data.tags ?? []).slice(0, 10)));
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 dark:border-gray-800">
      <h3 className="mb-3 text-sm font-semibold">Popular Topics</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags?topic=${tag.slug}`}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            {tag.name}
          </Link>
        ))}
      </div>
      <Link
        href="/tags"
        className="mt-3 block text-xs text-blue-600 hover:underline"
      >
        Browse all topics
      </Link>
    </div>
  );
}
