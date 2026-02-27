'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type CommunityPost = {
  id: number;
  communityId: number;
  communityName: string;
  communitySlug: string;
  authorId: number;
  title: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorBadge: string | null;
  voteCount: number;
  commentCount: number;
};

export function CommunityFeedTab() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/feed/my-communities?limit=20')
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
        <p className="mb-2 text-gray-500">No posts from your communities yet</p>
        <Link
          href="/communities"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Browse communities to join →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
        >
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
            <Link
              href={`/communities/${post.communitySlug}`}
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              onClick={(e) => e.stopPropagation()}
            >
              {post.communityName}
            </Link>
            <span>·</span>
            <span>{post.authorName}</span>
            <span>·</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="mb-1 font-medium">{post.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {post.body.length > 150 ? post.body.slice(0, 150) + '...' : post.body}
          </p>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>{post.voteCount} upvotes</span>
            <span>{post.commentCount} comments</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
