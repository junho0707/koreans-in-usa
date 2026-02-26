'use client';

import { Avatar } from '@/src/components/ui/avatar';
import { relativeTime } from '@/src/lib/relative-time';
import Link from 'next/link';

type PostCardProps = {
  id: number;
  title: string;
  body: string;
  type: string;
  score: number;
  commentCount?: number;
  regionId: string | null;
  tags?: string[];
  createdAt: string;
  authorId?: number;
  authorDisplayName?: string;
};

const TYPE_COLORS: Record<string, string> = {
  QA: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TIP: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  GENERAL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function PostCard({
  id,
  title,
  body,
  type,
  score,
  commentCount,
  regionId,
  tags,
  createdAt,
  authorId,
  authorDisplayName,
}: PostCardProps) {
  const snippet = body.length > 150 ? body.slice(0, 150) + '...' : body;

  return (
    <article className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
      <Link href={`/posts/${id}`} className="block">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? TYPE_COLORS.GENERAL}`}>
            {type}
          </span>
          {regionId && (
            <span className="text-xs text-gray-500">{regionId}</span>
          )}
          <span className="text-xs text-gray-400" title={new Date(createdAt).toLocaleString()}>
            {relativeTime(createdAt)}
          </span>
        </div>

        <h3 className="mb-1 font-semibold">{title}</h3>
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{snippet}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          {authorDisplayName && (
            <span className="flex items-center gap-1.5 font-medium text-gray-600 dark:text-gray-400">
              <Avatar name={authorDisplayName} size="sm" />
              {authorDisplayName}
            </span>
          )}
          <span>{score} vote{score !== 1 ? 's' : ''}</span>
          {commentCount !== undefined && (
            <span>{commentCount} comment{commentCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}
