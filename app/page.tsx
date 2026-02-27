'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NewsCard } from '@/src/components/news/news-card';
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

type NewsItem = {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
};

type LandingData = {
  usaPosts: FeedItem[];
  regionPosts: RegionSummary[];
  news: NewsItem[];
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feed/landing')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Card 1: US Feed */}
      <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/feed/usa" className="text-xl font-bold hover:underline">
            {t('landing.usFeed')}
          </Link>
          <Link
            href="/feed/usa"
            className="text-sm text-blue-600 hover:underline"
          >
            {t('landing.viewAll')}
          </Link>
        </div>

        {loading && (
          <p className="text-sm text-gray-500">{t('common.loading')}</p>
        )}

        {data && data.news.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
              {t('landing.news')}
            </h3>
            <div className="space-y-3">
              {data.news.map((item) => (
                <NewsCard key={item.id} {...item} publishedAt={item.publishedAt} />
              ))}
            </div>
          </div>
        )}

        {data && data.usaPosts.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
              {t('landing.topPosts')}
            </h3>
            <div className="grid gap-3">
              {data.usaPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  body={post.body}
                  type={post.type}
                  score={post.score}
                  commentCount={post.commentCount}
                  regionId={post.regionId}
                  createdAt={post.createdAt}
                  authorId={post.authorId}
                  authorDisplayName={post.authorDisplayName}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Card 2: By Region */}
      <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
        <h2 className="mb-4 text-xl font-bold">{t('landing.byRegion')}</h2>

        {loading && (
          <p className="text-sm text-gray-500">{t('common.loading')}</p>
        )}

        {data && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REGION_ORDER.map((regionId) => {
              const region = data.regionPosts.find(
                (r) => r.regionId === regionId,
              );
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

      {/* Card 3: Personal Feed (signed-in only) */}
      {user && (
        <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
          <h2 className="mb-4 text-xl font-bold">{t('landing.yourFeed')}</h2>
          <FeedList endpoint="/api/feed/personal?limit=20" />
        </section>
      )}
    </main>
  );
}
