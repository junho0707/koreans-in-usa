'use client';

import { Avatar } from '@/src/components/ui/avatar';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

type UserPreview = {
  id: number;
  displayName: string;
  reputation: number;
  badge: string | null;
  postCount: number;
  commentCount: number;
};

type Props = {
  userId: number;
  displayName: string;
  children: React.ReactNode;
};

const cache = new Map<number, UserPreview>();

export function UserHoverCard({ userId, displayName, children }: Props) {
  const [show, setShow] = useState(false);
  const [data, setData] = useState<UserPreview | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    timeoutRef.current = setTimeout(() => {
      setShow(true);
      if (cache.has(userId)) {
        setData(cache.get(userId)!);
      } else {
        fetch(`/api/users/${userId}/preview`)
          .then((r) => r.json())
          .then((d) => {
            cache.set(userId, d);
            setData(d);
          })
          .catch(() => {});
      }
    }, 300);
  }

  function handleLeave() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span className="relative inline-block" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {show && data && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start gap-2">
            <Avatar name={data.displayName} size="md" />
            <div className="min-w-0 flex-1">
              <Link href={`/users/${data.id}`} className="font-medium text-sm hover:underline">
                {data.displayName}
              </Link>
              {data.badge && (
                <span className="ml-1 text-xs text-gray-500">{data.badge}</span>
              )}
              <p className="text-xs text-gray-500">{data.reputation} rep</p>
            </div>
          </div>
          <div className="mt-2 flex gap-3 text-xs text-gray-500">
            <span>{data.postCount} posts</span>
            <span>{data.commentCount} comments</span>
          </div>
        </div>
      )}
    </span>
  );
}
