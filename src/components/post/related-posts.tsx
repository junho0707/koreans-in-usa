'use client';

import { relativeTime } from '@/src/lib/relative-time';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type RelatedPost = {
  id: number;
  title: string;
  type: string;
  score: number;
  commentCount: number;
  createdAt: string;
};

const TYPE_COLORS: Record<string, string> = {
  QA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TIP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  GENERAL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function RelatedPosts({ postId }: { postId: number }) {
  const [posts, setPosts] = useState<RelatedPost[]>([]);

  useEffect(() => {
    fetch(`/api/posts/${postId}/related`)
      .then((r) => r.json())
      .then((data) => setPosts(data.items ?? []))
      .catch(() => {});
  }, [postId]);

  if (posts.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-lg font-bold">Related Posts</h3>
      <div className="grid gap-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block rounded-lg border p-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${TYPE_COLORS[post.type] ?? TYPE_COLORS.GENERAL}`}>
                {post.type}
              </span>
              <span className="text-xs text-gray-400">{relativeTime(post.createdAt)}</span>
            </div>
            <p className="text-sm font-medium">{post.title}</p>
            <div className="mt-1 flex gap-3 text-xs text-gray-500">
              <span>{post.score} votes</span>
              <span>{post.commentCount} comments</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
