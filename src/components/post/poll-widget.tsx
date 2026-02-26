'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useState, useEffect } from 'react';

type PollOption = {
  id: number;
  label: string;
  voteCount: number;
};

type Poll = {
  id: number;
  question: string;
  endsAt: string | null;
  totalVotes: number;
  userVoteOptionId: number | null;
  options: PollOption[];
};

export function PollWidget({ postId }: { postId: number }) {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`/api/polls/${postId}`)
      .then((r) => r.json())
      .then((data) => setPoll(data.poll))
      .catch(() => {});
  }, [postId]);

  if (!poll) return null;

  const hasVoted = poll.userVoteOptionId !== null;
  const isExpired = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;
  const showResults = hasVoted || isExpired;

  async function vote(optionId: number) {
    if (!user || voting) return;
    setVoting(true);
    const res = await fetch(`/api/polls/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId }),
    });
    if (res.ok) {
      // Refetch to get updated counts
      const refetch = await fetch(`/api/polls/${postId}`);
      const data = await refetch.json();
      setPoll(data.poll);
    }
    setVoting(false);
  }

  return (
    <div className="my-4 rounded-lg border p-4 dark:border-gray-700">
      <h4 className="mb-3 font-medium">{poll.question}</h4>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const pct = poll.totalVotes > 0 ? Math.round((opt.voteCount / poll.totalVotes) * 100) : 0;
          const isSelected = poll.userVoteOptionId === opt.id;

          if (showResults) {
            return (
              <div key={opt.id} className="relative">
                <div
                  className={`absolute inset-0 rounded-lg ${
                    isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between px-3 py-2 text-sm">
                  <span className={isSelected ? 'font-medium' : ''}>
                    {isSelected && '+ '}{opt.label}
                  </span>
                  <span className="text-xs text-gray-500">{pct}%</span>
                </div>
              </div>
            );
          }

          return (
            <button
              key={opt.id}
              onClick={() => vote(opt.id)}
              disabled={voting || !user}
              className="w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''}
        {isExpired && ' · Poll ended'}
        {poll.endsAt && !isExpired && ` · Ends ${new Date(poll.endsAt).toLocaleDateString()}`}
      </p>
    </div>
  );
}
