'use client';

import Link from 'next/link';
import { relativeTime } from '@/src/lib/relative-time';
import { useEffect, useState } from 'react';

type TrendingPost = {
  id: number;
  title: string;
  score: number;
  commentCount: number;
  createdAt: string;
};

export function HotDiscussions() {
  const [posts, setPosts] = useState<TrendingPost[]>([]);

  useEffect(() => {
    fetch('/api/trending?limit=5')
      .then((r) => r.json())
      .then((data) => setPosts(data.items?.slice(0, 5) ?? []));
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 dark:border-gray-800">
      <h3 className="mb-3 text-sm font-semibold">Hot Discussions</h3>
      <div className="space-y-3">
        {posts.map((post, i) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block group"
          >
            <div className="flex gap-2">
              <span className="text-xs font-bold text-gray-400">{i + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium group-hover:text-blue-600">
                  {post.title}
                </p>
                <p className="text-xs text-gray-500">
                  {post.score} votes · {post.commentCount} comments · {relativeTime(post.createdAt)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href="/trending"
        className="mt-3 block text-xs text-blue-600 hover:underline"
      >
        See all trending
      </Link>
    </div>
  );
}
