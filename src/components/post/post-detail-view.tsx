'use client';

import { PostDetail } from '@/src/application/dto/post-detail';
import { BookmarkButton } from '@/src/components/bookmark/bookmark-button';
import { ShareButton } from '@/src/components/post/share-button';
import { TableOfContents } from '@/src/components/post/table-of-contents';
import { ImageGallery } from '@/src/components/ui/image-gallery';
import { Markdown } from '@/src/components/ui/markdown';
import { Avatar } from '@/src/components/ui/avatar';
import { UserHoverCard } from '@/src/components/ui/user-hover-card';
import { relativeTime } from '@/src/lib/relative-time';
import { estimateReadTime } from '@/src/lib/read-time';
import Link from 'next/link';

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

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <UserHoverCard userId={post.authorId} displayName={post.authorDisplayName}>
          <Link href={`/users/${post.authorId}`} className="flex items-center gap-1.5 hover:underline">
            <Avatar name={post.authorDisplayName} size="sm" />
            {post.authorDisplayName}
          </Link>
        </UserHoverCard>
        <span title={new Date(post.createdAt).toLocaleString()}>{relativeTime(post.createdAt)}</span>
        <span>{estimateReadTime(post.body)}</span>
        <span>{post.score} vote{post.score !== 1 ? 's' : ''}</span>
        <span>{post.commentCount} comment{post.commentCount !== 1 ? 's' : ''}</span>
        {post.viewCount > 0 && (
          <span>{post.viewCount.toLocaleString()} view{post.viewCount !== 1 ? 's' : ''}</span>
        )}
        <BookmarkButton postId={post.id} />
        <ShareButton postId={post.id} title={post.title} />
      </div>

      {post.imageUrl && (
        <div className="mb-4">
          <ImageGallery images={[post.imageUrl]} alt={post.title} />
        </div>
      )}

      <TableOfContents content={post.body} />
      <Markdown content={post.body} />
    </div>
  );
}
