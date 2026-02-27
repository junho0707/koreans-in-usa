'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';
import { PinnedPosts } from '@/src/components/feed/pinned-posts';
import { AnnouncementBanner } from '@/src/components/feed/announcement-banner';
import { PopularTags } from '@/src/components/tags/popular-tags';
import { HotDiscussions } from '@/src/components/feed/hot-discussions';
import { WhoToFollow } from '@/src/components/feed/who-to-follow';
import { CommunityInfo } from '@/src/components/feed/community-info';
import { FabCreate } from '@/src/components/post/fab-create';
import { CommunitySidebar } from '@/src/components/communities/community-sidebar';
import { CommunityFeedTab } from '@/src/components/communities/community-feed-tab';
import { useAuth } from '@/src/components/providers/auth-context';
import { useI18n } from '@/src/lib/i18n/context';
import { useState } from 'react';
import Link from 'next/link';

type FeedTab = 'qa' | 'tips' | 'following' | 'my-communities';
type FeedSort = 'top12h' | 'new' | 'top';

const SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: 'top12h', label: 'Hot' },
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
];

export default function UsaFeedPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<FeedTab>('qa');
  const [sort, setSort] = useState<FeedSort>('top12h');

  const tabs: { value: FeedTab; label: string; authRequired?: boolean }[] = [
    { value: 'qa', label: 'Q&A' },
    { value: 'tips', label: 'Tips' },
    { value: 'following', label: 'Following', authRequired: true },
    { value: 'my-communities', label: 'My Communities', authRequired: true },
  ];

  const feedEndpoint =
    tab === 'qa'
      ? `/api/feed/usa?sort=${sort}&type=QA&limit=30`
      : tab === 'tips'
        ? `/api/feed/usa?sort=${sort}&type=TIP&limit=30`
        : tab === 'following'
          ? `/api/feed/following?sort=${sort}&limit=30`
          : '';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('landing.usFeed')}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/communities"
            className="text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
          >
            Communities
          </Link>
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

      {/* Feed tabs */}
      <div className="mb-4 flex gap-1 border-b dark:border-gray-700">
        {tabs.map((t) => {
          if (t.authRequired && !user) return null;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                tab === t.value
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Sort controls (not shown for my-communities tab) */}
          {tab !== 'my-communities' && (
            <div className="mb-4 flex justify-end">
              <div className="flex gap-1">
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
            </div>
          )}

          <AnnouncementBanner />
          <PinnedPosts />

          {tab === 'my-communities' ? (
            <CommunityFeedTab />
          ) : (
            <FeedList endpoint={feedEndpoint} />
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
          <CommunitySidebar />
          <CommunityInfo />
          <PopularTags />
          <WhoToFollow />
          <HotDiscussions />
        </aside>
      </div>

      <FabCreate onClick={() => setShowCreate(true)} />
      {showCreate && <PostCreateModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
