'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CommunityCard from '@/src/components/communities/community-card';

type Community = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  scope: string;
  privacy: string;
};

export default function CommunitiesBrowser() {
  const [search, setSearch] = useState('');
  const [popular, setPopular] = useState<Community[]>([]);
  const [all, setAll] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/communities/popular?limit=6').then((r) => r.json()),
      fetch('/api/communities?limit=20').then((r) => r.json()),
    ])
      .then(([popularData, allData]) => {
        setPopular(popularData.communities ?? []);
        setAll(allData.communities ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? all.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : all;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Top bar: search + create */}
      <div className="flex items-center gap-3 mb-8">
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Link
          href="/communities/create"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition shrink-0"
        >
          Create Community
        </Link>
      </div>

      {/* Popular Communities */}
      {!search.trim() && popular.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Popular Communities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        </section>
      )}

      {/* All Communities */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          {search.trim() ? 'Search Results' : 'All Communities'}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500">
            {search.trim()
              ? 'No communities found matching your search.'
              : 'No communities yet. Be the first to create one!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
