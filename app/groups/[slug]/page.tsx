'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';

import { useAuth } from '@/src/components/providers/auth-context';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const REGION_NAMES: Record<string, string> = {
  northeast: 'Northeast',
  south: 'South',
  midwest: 'Midwest',
  west: 'West',
};

type FeedSort = 'top12h' | 'new' | 'top';

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'top12h', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

function RegionContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const state = searchParams.get('state');
  const [showCreate, setShowCreate] = useState(false);
  const [sort, setSort] = useState<FeedSort>('top12h');

  const regionName = REGION_NAMES[slug] ?? slug;
  const baseEndpoint = `/api/feed/region/${slug}?sort=${sort}&limit=30`;
  const endpoint = state ? `${baseEndpoint}&state=${state}` : baseEndpoint;

  const regionIdMap: Record<string, string> = {
    northeast: 'NE',
    south: 'S',
    midwest: 'MW',
    west: 'W',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{regionName} Feed</h1>
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
          >
            New Post
          </button>
        )}
      </div>

      {/* Sort controls */}
      <div className="mb-4 flex gap-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              sort === opt.value
                ? 'bg-foreground text-background'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <FeedList endpoint={endpoint} />
      {showCreate && (
        <PostCreateModal
          onClose={() => setShowCreate(false)}
          defaultRegion={regionIdMap[slug]}
        />
      )}
    </main>
  );
}

export default function RegionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-8">Loading...</div>}>
      <RegionContent />
    </Suspense>
  );
}
