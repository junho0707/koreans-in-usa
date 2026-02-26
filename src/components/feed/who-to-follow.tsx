'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { Avatar } from '@/src/components/ui/avatar';
import { FollowButton } from '@/src/components/follow/follow-button';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type SuggestedUser = {
  id: number;
  displayName: string;
  reputation: number;
  postCount: number;
};

export function WhoToFollow() {
  const { user } = useAuth();
  const [items, setItems] = useState<SuggestedUser[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/users/suggested')
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {});
  }, [user]);

  if (!user || items.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 dark:border-gray-800">
      <h3 className="mb-3 text-sm font-semibold">Who to Follow</h3>
      <div className="space-y-3">
        {items.slice(0, 3).map((u) => (
          <div key={u.id} className="flex items-center gap-2">
            <Avatar name={u.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <Link href={`/users/${u.id}`} className="text-sm font-medium hover:underline truncate block">
                {u.displayName}
              </Link>
              <p className="text-xs text-gray-500">{u.reputation} rep</p>
            </div>
            <FollowButton targetUserId={u.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
