'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useState, useEffect } from 'react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

type Reaction = {
  emoji: string;
  count: number;
};

export function ReactionBar({ postId }: { postId: number }) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [viewerReactions, setViewerReactions] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/reactions`)
      .then((r) => r.json())
      .then((data) => {
        setReactions(data.reactions ?? []);
        setViewerReactions(data.viewerReactions ?? []);
      })
      .catch(() => {});
  }, [postId]);

  async function toggleReaction(emoji: string) {
    if (!user) return;

    // Optimistic update
    const wasReacted = viewerReactions.includes(emoji);
    setViewerReactions((prev) =>
      wasReacted ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
    setReactions((prev) => {
      const existing = prev.find((r) => r.emoji === emoji);
      if (wasReacted) {
        if (existing && existing.count <= 1) return prev.filter((r) => r.emoji !== emoji);
        return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1 } : r);
      }
      if (existing) return prev.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
      return [...prev, { emoji, count: 1 }];
    });

    await fetch(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    }).catch(() => {});

    setShowPicker(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => toggleReaction(r.emoji)}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm transition ${
            viewerReactions.includes(r.emoji)
              ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30'
              : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
          }`}
        >
          <span>{r.emoji}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">{r.count}</span>
        </button>
      ))}
      {user && (
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 dark:border-gray-700"
            title="Add reaction"
          >
            +
          </button>
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-1 rounded-lg border bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className="rounded p-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
