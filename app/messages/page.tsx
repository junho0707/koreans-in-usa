'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Conversation = {
  id: number;
  otherUserId: number;
  otherDisplayName: string;
  lastMessageBody: string;
  lastMessageAt: string;
  unreadCount: number;
};

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/messages/conversations')
      .then((r) => r.json())
      .then((data) => setConversations(data.items))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) return <div className="mx-auto max-w-2xl px-4 py-16">Loading...</div>;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
        <div className="space-y-1">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className={`block rounded-lg px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                c.unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{c.otherDisplayName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(c.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                  {c.lastMessageBody}
                </p>
                {c.unreadCount > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
