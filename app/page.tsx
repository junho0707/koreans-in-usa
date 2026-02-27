'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PostCard } from '@/src/components/post/post-card';
import { FeedList } from '@/src/components/feed-list';
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
  usaPosts: FeedItem[];
  regionPosts: RegionSummary[];
};

const REGION_ORDER = ['NE', 'S', 'MW', 'W'];
const REGION_LABELS: Record<string, string> = {
  NE: 'Northeast',
  S: 'South',
  MW: 'Midwest',
  W: 'West',
};

export default function Home() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<LandingData | null>(null);
  const [communities, setCommunities] = useState<CommunityPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/feed/landing').then((r) => r.json()),
      fetch('/api/communities/popular?limit=6').then((r) => r.json()),
    ])
      .then(([landingData, commData]) => {
        setData(landingData);
        setCommunities(Array.isArray(commData) ? commData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Split usaPosts into Q&A and Tips
  const qaPosts = data?.usaPosts.filter((p) => p.type === 'QA').slice(0, 5) ?? [];
  const tipPosts = data?.usaPosts.filter((p) => p.type === 'TIP').slice(0, 5) ?? [];

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

      {/* Q&A + Tips side by side */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Latest Q&A */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Latest Q&A</h2>
            <Link
              href="/feed/usa"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View all →
            </Link>
          </div>
          {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
          {qaPosts.length > 0 ? (
            <div className="space-y-3">
              {qaPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-md p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <h3 className="text-sm font-medium">{post.title}</h3>
                  <div className="mt-1 flex gap-3 text-xs text-gray-500">
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

        {/* Latest Tips */}
        <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Latest Tips</h2>
            <Link
              href="/feed/usa"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View all →
            </Link>
          </div>
          {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
          {tipPosts.length > 0 ? (
            <div className="space-y-3">
              {tipPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-md p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <h3 className="text-sm font-medium">{post.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                    {post.body.slice(0, 120)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            !loading && <p className="text-sm text-gray-400">No tips yet</p>
          )}
        </div>
      </section>

      {/* Popular Communities */}
      {communities.length > 0 && (
        <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Popular Communities</h2>
            <Link
              href="/communities"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((c) => (
              <Link
                key={c.id}
                href={`/communities/${c.slug}`}
                className="rounded-lg border border-gray-100 p-4 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
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

      {/* By Region */}
      <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-lg font-bold">{t('landing.byRegion')}</h2>
        {loading && <p className="text-sm text-gray-500">{t('common.loading')}</p>}
        {data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REGION_ORDER.map((regionId) => {
              const region = data.regionPosts.find((r) => r.regionId === regionId);
              const slug = region?.slug ?? regionId.toLowerCase();
              const name = region?.name ?? REGION_LABELS[regionId] ?? regionId;
              return (
                <div
                  key={regionId}
                  className="rounded-lg border border-gray-100 p-4 dark:border-gray-800"
                >
                  <Link
                    href={`/groups/${slug}`}
                    className="mb-2 block text-sm font-semibold hover:text-blue-600"
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

      {/* Personal Feed (signed-in only) */}
      {user && (
        <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="mb-4 text-xl font-bold">{t('landing.yourFeed')}</h2>
          <FeedList endpoint="/api/feed/personal?limit=20" />
        </section>
      )}
    </main>
  );
}
