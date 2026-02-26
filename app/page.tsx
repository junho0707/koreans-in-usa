'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';
import { NewsSection } from '@/src/components/news/news-section';
import { PinnedPosts } from '@/src/components/feed/pinned-posts';
import { PopularTags } from '@/src/components/tags/popular-tags';
import { HotDiscussions } from '@/src/components/feed/hot-discussions';
import { CommunityInfo } from '@/src/components/feed/community-info';
import { useAuth } from '@/src/components/providers/auth-context';
import { useI18n } from '@/src/lib/i18n/context';
import { useState } from 'react';
import Link from 'next/link';

type FeedSort = 'top12h' | 'new' | 'top';
type PostTypeFilter = '' | 'QA' | 'TIP' | 'GENERAL';

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'top12h', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

const TYPE_FILTERS: { value: PostTypeFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'QA', label: 'Q&A' },
  { value: 'TIP', label: 'Tips' },
  { value: 'GENERAL', label: 'General' },
];

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'usa' | 'following'>('usa');
  const [sort, setSort] = useState<FeedSort>('top12h');
  const [typeFilter, setTypeFilter] = useState<PostTypeFilter>('');

  const feedEndpoint = typeFilter
    ? `/api/feed/usa?sort=${sort}&type=${typeFilter}&limit=30`
    : `/api/feed/usa?sort=${sort}&limit=30`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('feed.title')}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/trending"
            className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
          >
            {t('feed.trending')}
          </Link>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
            >
              {t('feed.newPost')}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Feed tabs */}
          <div className="mb-4 flex items-center justify-between border-b dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setTab('usa')}
                className={`px-4 py-2 text-sm font-medium ${tab === 'usa' ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
              >
                {t('feed.usaFeed')}
              </button>
              {user && (
                <button
                  onClick={() => setTab('following')}
                  className={`px-4 py-2 text-sm font-medium ${tab === 'following' ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
                >
                  {t('feed.following')}
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

          {/* Type filter */}
          {tab === 'usa' && (
            <div className="mb-4 flex gap-2">
              {TYPE_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    typeFilter === opt.value
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {tab === 'usa' && (
            <>
              <PinnedPosts />
              <div className="mb-6">
                <NewsSection />
              </div>
              <FeedList endpoint={feedEndpoint} />
            </>
          )}

          {tab === 'following' && (
            <FeedList endpoint="/api/feed/following?limit=30" />
          )}
        </div>

        {/* Sidebar - hidden on mobile */}
        <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
          <CommunityInfo />
          <PopularTags />
          <HotDiscussions />
        </aside>
      </div>

      {showCreate && <PostCreateModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
