'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';
import { NewsSection } from '@/src/components/news/news-section';
import { useAuth } from '@/src/components/providers/auth-context';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const REGION_NAMES: Record<string, string> = {
  northeast: 'Northeast',
  south: 'South',
  midwest: 'Midwest',
  west: 'West',
};

function RegionContent() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const state = searchParams.get('state');
  const [showCreate, setShowCreate] = useState(false);

  const regionName = REGION_NAMES[slug] ?? slug;
  const endpoint = state
    ? `/api/feed/region/${slug}?sort=top12h&state=${state}&limit=30`
    : `/api/feed/region/${slug}?sort=top12h&limit=30`;

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

      <div className="mb-8">
        <NewsSection endpoint={`/api/news?tag=${slug}&limit=5`} />
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
