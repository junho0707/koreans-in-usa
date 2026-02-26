'use client';

import { Avatar } from '@/src/components/ui/avatar';
import { relativeTime } from '@/src/lib/relative-time';
import { useToast } from '@/src/components/ui/toast';
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
  const { toast } = useToast();
  const snippet = body.length > 150 ? body.slice(0, 150) + '...' : body;

  function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/posts/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast('Link copied!', 'success');
    }).catch(() => {});
  }

  return (
    <article className="group rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
      <Link href={`/posts/${id}`} className="block">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[type] ?? TYPE_COLORS.GENERAL}`}>
            {type}
          </span>
          {regionId && (
            <span className="text-xs text-gray-500">{regionId}</span>
          )}
          <span className="flex-1 text-xs text-gray-400" title={new Date(createdAt).toLocaleString()}>
            {relativeTime(createdAt)}
          </span>
          <button
            onClick={copyLink}
            className="opacity-0 transition group-hover:opacity-100 text-gray-400 hover:text-foreground"
            title="Copy link"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
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
