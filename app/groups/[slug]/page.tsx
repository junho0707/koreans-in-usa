'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';
import { SearchOverlay } from '@/src/components/search/search-overlay';

import { useAuth } from '@/src/components/providers/auth-context';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';

const REGION_NAMES: Record<string, string> = {
  northeast: 'Northeast',
  south: 'South',
  midwest: 'Midwest',
  west: 'West',
};

const REGION_ID_MAP: Record<string, string> = {
  northeast: 'NE',
  south: 'S',
  midwest: 'MW',
  west: 'W',
};

type FeedSort = 'top12h' | 'new' | 'top';
type FeedType = 'QA' | 'TIP' | '';

type RegionHeadline = { id: number; title: string; score: number; commentCount: number; body: string };

type CommunityPreview = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
};

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<FeedSort>('top12h');
  const [activeTab, setActiveTab] = useState<FeedType>('QA');

  // Region summary data
  const [qaPosts, setQaPosts] = useState<RegionHeadline[]>([]);
  const [tipPosts, setTipPosts] = useState<RegionHeadline[]>([]);
  const [communities, setCommunities] = useState<CommunityPreview[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const regionName = REGION_NAMES[slug] ?? slug;
  const regionId = REGION_ID_MAP[slug] ?? slug.toUpperCase();

  // Fetch region summary (top Q&A + Tips headlines + communities)
  useEffect(() => {
    setSummaryLoading(true);
    Promise.all([
      fetch(`/api/feed/region/${slug}?sort=top12h&limit=5&type=QA`).then((r) => r.json()),
      fetch(`/api/feed/region/${slug}?sort=top12h&limit=5&type=TIP`).then((r) => r.json()),
      fetch(`/api/communities/popular?limit=4&region=${regionId}`).then((r) => r.json()),
    ])
      .then(([qaData, tipData, commData]) => {
        setQaPosts(qaData.items ?? []);
        setTipPosts(tipData.items ?? []);
        setCommunities(Array.isArray(commData) ? commData : []);
      })
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [slug, regionId]);

  // Full feed endpoint with tab + sort
  const typeParam = activeTab ? `&type=${activeTab}` : '';
  const baseEndpoint = `/api/feed/region/${slug}?sort=${sort}&limit=20${typeParam}`;
  const endpoint = state ? `${baseEndpoint}&state=${state}` : baseEndpoint;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{regionName}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-lg border border-gray-200 p-2.5 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            aria-label="Search"
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
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

      {/* Top Q&A + Tips summary cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Q&A summary */}
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Q&A</h3>
            <button
              onClick={() => setActiveTab('QA')}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              View all →
            </button>
          </div>
          {summaryLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : qaPosts.length > 0 ? (
            <div className="space-y-2">
              {qaPosts.slice(0, 5).map((post) => (
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
            <p className="text-sm text-gray-400">No questions yet</p>
          )}
        </div>

        {/* Tips summary */}
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Tips</h3>
            <button
              onClick={() => setActiveTab('TIP')}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              View all →
            </button>
          </div>
          {summaryLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : tipPosts.length > 0 ? (
            <div className="space-y-2">
              {tipPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-md px-2 py-1.5 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <h4 className="text-sm font-medium leading-snug">{post.title}</h4>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {post.body?.slice(0, 100)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No tips yet</p>
          )}
        </div>
      </div>

      {/* Region Communities */}
      {communities.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Communities in {regionName}</h2>
            <Link
              href="/communities"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {communities.map((c) => (
              <Link
                key={c.id}
                href={`/communities/${c.slug}`}
                className="rounded-lg border border-gray-200 p-3 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              >
                <h3 className="text-sm font-medium">{c.name}</h3>
                {c.description && (
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{c.description}</p>
                )}
                <span className="mt-1 text-xs text-gray-400">{c.memberCount} members</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Full feed with tabs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          {/* Type tabs */}
          <div className="flex gap-1">
            {([
              { value: 'QA' as FeedType, label: 'Q&A' },
              { value: 'TIP' as FeedType, label: 'Tips' },
              { value: '' as FeedType, label: 'All' },
            ]).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  activeTab === tab.value
                    ? 'bg-foreground text-background'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort controls */}
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

        <FeedList endpoint={endpoint} />
      </section>

      {showCreate && (
        <PostCreateModal
          onClose={() => setShowCreate(false)}
          defaultRegion={regionId}
        />
      )}

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        defaultRegion={regionId}
      />
    </main>
  );
}

export default function RegionPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-8">Loading...</div>}>
      <RegionContent />
    </Suspense>
  );
}
