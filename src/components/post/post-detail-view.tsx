'use client';

import { PostDetail } from '@/src/application/dto/post-detail';

type Props = {
  post: PostDetail;
};

const TYPE_COLORS: Record<string, string> = {
  QA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TIP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  GENERAL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function PostDetailView({ post }: Props) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[post.type] ?? TYPE_COLORS.GENERAL}`}>
          {post.type}
        </span>
        {post.regionId && (
          <span className="text-xs text-gray-500">{post.regionId}</span>
        )}
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mb-2 text-2xl font-bold">{post.title}</h1>

      <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
        <span>by {post.authorDisplayName}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        <span>{post.score} vote{post.score !== 1 ? 's' : ''}</span>
        <span>{post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
        {post.body}
      </div>
    </div>
  );
}
