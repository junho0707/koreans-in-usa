'use client';

import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type PostItem = {
  id: number;
  title: string;
  type: string;
  score: number;
  commentCount: number;
  createdAt: string;
};

type CommentItem = {
  id: number;
  postId: number;
  postTitle: string;
  body: string;
  score: number;
  createdAt: string;
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'info' | 'posts' | 'comments'>('info');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [postsCursor, setPostsCursor] = useState<number | null>(null);
  const [commentsCursor, setCommentsCursor] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    if (tab === 'posts' && posts.length === 0) {
      fetch(`/api/users/${user.id}/posts`)
        .then((r) => r.json())
        .then((data) => {
          setPosts(data.items);
          setPostsCursor(data.nextCursor);
        });
    }
    if (tab === 'comments' && comments.length === 0) {
      fetch(`/api/users/${user.id}/comments`)
        .then((r) => r.json())
        .then((data) => {
          setComments(data.items);
          setCommentsCursor(data.nextCursor);
        });
    }
  }, [user, tab, posts.length, comments.length]);

  if (loading) {
    return <div className="mx-auto max-w-lg px-4 py-16">Loading...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  function loadMorePosts() {
    if (!postsCursor || !user) return;
    fetch(`/api/users/${user.id}/posts?cursor=${postsCursor}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts((prev) => [...prev, ...data.items]);
        setPostsCursor(data.nextCursor);
      });
  }

  function loadMoreComments() {
    if (!commentsCursor || !user) return;
    fetch(`/api/users/${user.id}/comments?cursor=${commentsCursor}`)
      .then((r) => r.json())
      .then((data) => {
        setComments((prev) => [...prev, ...data.items]);
        setCommentsCursor(data.nextCursor);
      });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link
          href="/profile/edit"
          className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
        >
          Edit
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b dark:border-gray-700">
        {(['info', 'posts', 'comments'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
          >
            {t === 'info' ? 'Profile' : t}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="mt-6 space-y-4">
          <div>
            <span className="text-sm text-gray-500">Display Name</span>
            <p className="font-medium">{user.displayName}</p>
          </div>
          {user.username && (
            <div>
              <span className="text-sm text-gray-500">Username</span>
              <p>@{user.username}</p>
            </div>
          )}
          {user.email && (
            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p>{user.email}</p>
            </div>
          )}
          {user.phone && (
            <div>
              <span className="text-sm text-gray-500">Phone</span>
              <p>{user.phone}</p>
            </div>
          )}
        </div>
      )}

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="mt-4 space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">You haven&apos;t posted anything yet.</p>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-lg border p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">{post.type}</span>
                  <span className="font-medium">{post.title}</span>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-gray-500">
                  <span>{post.score} votes</span>
                  <span>{post.commentCount} comments</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          )}
          {postsCursor && (
            <button onClick={loadMorePosts} className="w-full rounded-lg border py-2 text-sm hover:bg-gray-50 dark:border-gray-700">
              Load more
            </button>
          )}
        </div>
      )}

      {/* Comments tab */}
      {tab === 'comments' && (
        <div className="mt-4 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">You haven&apos;t commented yet.</p>
          ) : (
            comments.map((comment) => (
              <Link
                key={comment.id}
                href={`/posts/${comment.postId}`}
                className="block rounded-lg border p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
              >
                <p className="text-xs text-gray-500">
                  on <span className="font-medium text-foreground">{comment.postTitle}</span>
                </p>
                <p className="mt-1 text-sm">{comment.body.length > 200 ? comment.body.slice(0, 200) + '...' : comment.body}</p>
                <div className="mt-1 flex gap-3 text-xs text-gray-500">
                  <span>{comment.score} votes</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          )}
          {commentsCursor && (
            <button onClick={loadMoreComments} className="w-full rounded-lg border py-2 text-sm hover:bg-gray-50 dark:border-gray-700">
              Load more
            </button>
          )}
        </div>
      )}
    </main>
  );
}
