'use client';

export function PostCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mb-1 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mb-3 space-y-1">
        <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
