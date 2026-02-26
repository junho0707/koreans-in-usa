'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, use } from 'react';

type Message = {
  id: number;
  senderId: number;
  senderDisplayName: string;
  body: string;
  createdAt: string;
};

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    function fetchMessages() {
      fetch(`/api/messages/${id}`)
        .then((r) => r.json())
        .then((data) => {
          setMessages(data.items.reverse());
          setCursor(data.nextCursor);
        })
        .finally(() => setLoading(false));
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, authLoading, id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newMsg.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, { ...msg, senderDisplayName: user!.displayName }]);
        setNewMsg('');
      }
    } finally {
      setSending(false);
    }
  }

  function loadOlder() {
    if (!cursor) return;
    fetch(`/api/messages/${id}?cursor=${cursor}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages((prev) => [...data.items.reverse(), ...prev]);
        setCursor(data.nextCursor);
      });
  }

  if (authLoading || loading) return <div className="mx-auto max-w-2xl px-4 py-16">Loading...</div>;

  return (
    <main className="mx-auto flex max-w-2xl flex-col px-4 py-8" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => router.push('/messages')} className="text-gray-500 hover:text-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold">Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-4">
        {cursor && (
          <button onClick={loadOlder} className="mb-2 w-full text-center text-sm text-blue-600 hover:underline">
            Load older messages
          </button>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                isMine
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {!isMine && (
                  <p className="mb-0.5 text-xs font-medium text-gray-500">{msg.senderDisplayName}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className={`mt-1 text-[10px] ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t pt-3 dark:border-gray-700">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button
          type="submit"
          disabled={!newMsg.trim() || sending}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
