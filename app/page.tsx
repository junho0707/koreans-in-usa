'use client';

import { FeedList } from '@/src/components/feed-list';
import { PostCreateModal } from '@/src/components/post/post-create-modal';
import { NewsSection } from '@/src/components/news/news-section';
import { useAuth } from '@/src/components/providers/auth-context';
import { useState } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">USA Feed</h1>
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
          >
            New Post
          </button>
        )}
      </div>

      <div className="mb-8">
        <NewsSection />
      </div>

      <FeedList endpoint="/api/feed/usa?sort=top12h&limit=30" />
      {showCreate && <PostCreateModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}
