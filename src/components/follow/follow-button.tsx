'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/components/providers/auth-context';

export function FollowButton({ targetUserId }: { targetUserId: number }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    fetch(`/api/follows/check?userId=${targetUserId}`)
      .then((r) => r.json())
      .then((data) => setFollowing(data.following))
      .catch(() => {});
  }, [user, targetUserId]);

  if (!user || user.id === targetUserId) return null;

  async function handleToggle() {
    setLoading(true);
    setFollowing(!following);
    try {
      const res = await fetch('/api/follows/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json();
      setFollowing(data.following);
    } catch {
      setFollowing(following);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
        following
          ? 'border border-gray-300 hover:border-red-300 hover:text-red-600 dark:border-gray-600'
          : 'bg-foreground text-background'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
