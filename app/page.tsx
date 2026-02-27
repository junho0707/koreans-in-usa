'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FeedList } from '@/src/components/feed-list';
import { SearchOverlay } from '@/src/components/search/search-overlay';
import { useAuth } from '@/src/components/providers/auth-context';
import { useI18n } from '@/src/lib/i18n/context';

type FeedItem = {
  id: number;
  title: string;
  body: string;
  type: string;
  score: number;
  commentCount: number;
  regionId: string | null;
  createdAt: string;
  authorId: number;
  authorDisplayName: string;
};

type RegionHeadline = { id: number; title: string };
type RegionSummary = {
  regionId: string;
  slug: string;
  name: string;
  posts: RegionHeadline[];
};

type CommunityPreview = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  scope: string;
  privacy: string;
};

type LandingData = {
  usaQA: FeedItem[];
  usaTips: FeedItem[];
  regionPosts: RegionSummary[];
  publicCommunities: CommunityPreview[];
};

const REGION_ORDER = ['NE', 'S', 'MW', 'W'];
const REGION_LABELS: Record<string, string> = {
  NE: 'Northeast',
  S: 'South',
  MW: 'Midwest',
  W: 'West',
};

type ViewMode = 'discover' | 'myfeed';

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('landing-view') as ViewMode) || 'discover';
    }
    return 'discover';
  });

  useEffect(() => {
    fetch('/api/feed/landing')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('landing-view', viewMode);
  }, [viewMode]);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      {/* Hero (logged out only) */}
      {!user && (
        <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <h1 className="mb-2 text-3xl font-bold">Your Korean Community in the USA</h1>
          <p className="mb-6 text-blue-100">
            Ask questions, share tips, and connect with fellow Koreans across America.
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-white px-6 py-2.5 font-medium text-blue-700 hover:bg-blue-50"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-white/30 px-6 py-2.5 font-medium hover:bg-white/10"
            >
              Log In
            </Link>
          </div>
        </section>
      )}

      {/* Top bar: view toggle + search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('discover')}
                className={`rounded-l-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'discover'
                    ? 'bg-foreground text-background'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setViewMode('myfeed')}
                className={`rounded-r-lg px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'myfeed'
                    ? 'bg-foreground text-background'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                My Feed
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="rounded-lg border border-gray-200 p-2.5 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          aria-label="Search"
        >
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Custom Feed view */}
      {user && viewMode === 'myfeed' ? (
        <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="mb-4 text-xl font-bold">{t('landing.yourFeed')}</h2>
          <FeedList endpoint="/api/feed/personal?limit=20" />
        </section>
      ) : (
        <>
          {/* US General (Big Card) */}
          <section className="rounded-xl border-2 border-blue-200 bg-blue-50/30 p-6 dark:border-blue-900 dark:bg-blue-950/20">
            <h2 className="mb-4 text-xl font-bold">US General</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Q&A sub-card */}
              <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Q&A</h3>
                  <Link
                    href="/feed/usa?type=QA"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View all →
                  </Link>
                </div>
                {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
                {data && data.usaQA.length > 0 ? (
                  <div className="space-y-2">
                    {data.usaQA.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="block rounded-md px-2 py-1.5 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <h4 className="text-sm font-medium leading-snug">{post.title}</h4>
                        <div className="mt-0.5 flex gap-3 text-xs text-gray-500">
                          <span>{post.score} votes</span>
                          <span>{post.commentCount} answers</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  !loading && <p className="text-sm text-gray-400">No questions yet</p>
                )}
              </div>

              {/* Tips sub-card */}
              <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Tips</h3>
                  <Link
                    href="/feed/usa?type=TIP"
                    className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View all →
                  </Link>
                </div>
                {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
                {data && data.usaTips.length > 0 ? (
                  <div className="space-y-2">
                    {data.usaTips.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        className="block rounded-md px-2 py-1.5 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <h4 className="text-sm font-medium leading-snug">{post.title}</h4>
                        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                          {post.body.slice(0, 100)}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  !loading && <p className="text-sm text-gray-400">No tips yet</p>
                )}
              </div>
            </div>
          </section>

          {/* Regions (4 cards grid) */}
          <section>
            <h2 className="mb-4 text-lg font-bold">{t('landing.byRegion')}</h2>
            {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
            {data && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {REGION_ORDER.map((regionId) => {
                  const region = data.regionPosts.find((r) => r.regionId === regionId);
                  const slug = region?.slug ?? regionId.toLowerCase();
                  const name = region?.name ?? REGION_LABELS[regionId] ?? regionId;
                  return (
                    <div
                      key={regionId}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                    >
                      <Link
                        href={`/groups/${slug}`}
                        className="mb-2 block font-semibold hover:text-blue-600"
                      >
                        {name}
                      </Link>
                      {region && region.posts.length > 0 ? (
                        <ul className="space-y-1">
                          {region.posts.map((post) => (
                            <li key={post.id}>
                              <Link
                                href={`/posts/${post.id}`}
                                className="block truncate text-sm text-gray-600 hover:text-foreground dark:text-gray-400"
                              >
                                {post.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400">No recent posts</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Public Communities */}
          {data && data.publicCommunities.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Public Communities</h2>
                <Link
                  href="/communities"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Browse all →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.publicCommunities.map((c) => (
                  <Link
                    key={c.id}
                    href={`/communities/${c.slug}`}
                    className="rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  >
                    <h3 className="font-medium">{c.name}</h3>
                    {c.description && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {c.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                        {c.scope === 'USA' ? 'USA' : 'Regional'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {c.memberCount} members
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </main>
  );
}
