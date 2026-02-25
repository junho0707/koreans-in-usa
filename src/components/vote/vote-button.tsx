'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {
  targetType: 'POST' | 'COMMENT';
  targetId: number;
  initialScore: number;
  initialVoted: boolean;
};

export function VoteButton({ targetType, targetId, initialScore, initialVoted }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [score, setScore] = useState(initialScore);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  async function handleVote() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (loading) return;

    // Optimistic update
    setVoted(!voted);
    setScore(voted ? score - 1 : score + 1);
    setLoading(true);

    try {
      const res = await fetch('/api/votes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId }),
      });

      if (res.ok) {
        const data = await res.json();
        setVoted(data.active);
        // Reconcile score based on server response
        setScore(data.active ? initialScore + 1 : initialScore);
      } else {
        // Revert optimistic update
        setVoted(voted);
        setScore(score);
      }
    } catch {
      setVoted(voted);
      setScore(score);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={handleVote}
      className={`flex items-center gap-1 text-sm ${
        voted ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400'
      }`}
      aria-label={voted ? 'Remove vote' : 'Upvote'}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill={voted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path d="M12 4l-8 8h5v8h6v-8h5z" />
      </svg>
      <span>{score}</span>
    </button>
  );
}
