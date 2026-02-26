'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';
import { NewsSection } from '@/src/components/news/news-section';
import { PinnedPosts } from '@/src/components/feed/pinned-posts';
import { useAuth } from '@/src/components/providers/auth-context';
import { useState } from 'react';
import Link from 'next/link';

type FeedSort = 'top12h' | 'new' | 'top';

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'top12h', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

export default function Home() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'usa' | 'following'>('usa');
  const [sort, setSort] = useState<FeedSort>('top12h');

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/trending"
            className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
          >
            Trending
          </Link>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
            >
              New Post
            </button>
          )}
        </div>
      </div>

      {/* Feed tabs */}
      <div className="mb-4 flex items-center justify-between border-b dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setTab('usa')}
            className={`px-4 py-2 text-sm font-medium ${tab === 'usa' ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
          >
            USA Feed
          </button>
          {user && (
            <button
              onClick={() => setTab('following')}
              className={`px-4 py-2 text-sm font-medium ${tab === 'following' ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
            >
              Following
            </button>
          )}
        </div>

        {/* Sort controls */}
        {tab === 'usa' && (
          <div className="flex gap-1 pb-2">
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
        )}
      </div>

      {tab === 'usa' && (
        <>
          <PinnedPosts />
          <div className="mb-8">
            <NewsSection />
          </div>
          <FeedList endpoint={`/api/feed/usa?sort=${sort}&limit=30`} />
        </>
      )}

      {tab === 'following' && (
        <FeedList endpoint="/api/feed/following?limit=30" />
      )}

      {showCreate && <PostCreateModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
