'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type CommunityPreview = {
  id: number;
  name: string;
  slug: string;
  memberCount: number;
};

export function CommunitySidebar() {
  const [communities, setCommunities] = useState<CommunityPreview[]>([]);

  useEffect(() => {
    fetch('/api/communities/popular?limit=5')
      .then((r) => r.json())
      .then((data) => setCommunities(data))
      .catch(() => {});
  }, []);

  if (communities.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="mb-3 text-sm font-semibold">Popular Communities</h3>
      <div className="space-y-2">
        {communities.map((c) => (
          <Link
            key={c.id}
            href={`/communities/${c.slug}`}
            className="block rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="font-medium">{c.name}</span>
            <span className="ml-2 text-xs text-gray-500">
              {c.memberCount} members
            </span>
          </Link>
        ))}
      </div>
      <Link
        href="/communities"
        className="mt-3 block text-xs text-blue-600 hover:underline dark:text-blue-400"
      >
        Browse all communities →
      </Link>
    </div>
  );
}
