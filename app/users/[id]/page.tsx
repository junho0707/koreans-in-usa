'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FollowButton } from '@/src/components/follow/follow-button';
import { Avatar } from '@/src/components/ui/avatar';
import { ActivityHeatmap } from '@/src/components/ui/activity-heatmap';
import { relativeTime } from '@/src/lib/relative-time';
import { useAuth } from '@/src/components/providers/auth-context';

type PublicUser = {
  id: number;
  displayName: string;
  profileState: string | null;
  city: string | null;
  interests: string[];
  koreanXIdentity: string | null;
  reputation: number;
  badge: string | null;
  createdAt: string;
};

const BADGE_COLORS: Record<string, string> = {
  newcomer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  contributor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  expert: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  legend: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

const BADGE_LABELS: Record<string, string> = {
  newcomer: 'Newcomer',
  contributor: 'Contributor',
  active: 'Active Member',
  expert: 'Expert',
  legend: 'Legend',
};

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

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user: currentUser } = useAuth();
  const dmRouter = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [tab, setTab] = useState<'posts' | 'comments'>('posts');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [postsCursor, setPostsCursor] = useState<number | null>(null);
  const [commentsCursor, setCommentsCursor] = useState<number | null>(null);
  const [followers, setFollowers] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${id}`).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`/api/users/${id}/followers`).then((r) => r.json()).catch(() => ({ followers: 0, following: 0 })),
      fetch(`/api/users/${id}/activity`).then((r) => r.json()).catch(() => ({ activity: {} })),
    ])
      .then(([userData, followData, activityData]) => {
        setUser(userData);
        setFollowers(followData.followers ?? 0);
        setFollowingCount(followData.following ?? 0);
        setActivity(activityData.activity ?? {});
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    if (tab === 'posts' && posts.length === 0) {
      fetch(`/api/users/${id}/posts`)
        .then((r) => r.json())
        .then((data) => {
          setPosts(data.items);
          setPostsCursor(data.nextCursor);
        });
    }
    if (tab === 'comments' && comments.length === 0) {
      fetch(`/api/users/${id}/comments`)
        .then((r) => r.json())
        .then((data) => {
          setComments(data.items);
          setCommentsCursor(data.nextCursor);
        });
    }
  }, [user, tab, id, posts.length, comments.length]);

  function loadMorePosts() {
    if (!postsCursor) return;
    fetch(`/api/users/${id}/posts?cursor=${postsCursor}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts((prev) => [...prev, ...data.items]);
        setPostsCursor(data.nextCursor);
      });
  }

  function loadMoreComments() {
    if (!commentsCursor) return;
    fetch(`/api/users/${id}/comments?cursor=${commentsCursor}`)
      .then((r) => r.json())
      .then((data) => {
        setComments((prev) => [...prev, ...data.items]);
        setCommentsCursor(data.nextCursor);
      });
  }

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-16">Loading...</div>;
  if (error || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-bold">User not found</h1>
        <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Back to feed</Link>
      </div>
    );
  }

  const joined = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={user.displayName} size="lg" />
            <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              {user.badge && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_COLORS[user.badge] ?? BADGE_COLORS.newcomer}`}>
                  {BADGE_LABELS[user.badge] ?? user.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{user.reputation} reputation</p>
            <p className="mt-1 text-sm text-gray-500">
              Joined {joined}
              {user.city && user.profileState && ` · ${user.city}, ${user.profileState}`}
              {!user.city && user.profileState && ` · ${user.profileState}`}
            </p>
            <div className="mt-2 flex gap-4 text-sm">
              <span><strong>{followers}</strong> <span className="text-gray-500">followers</span></span>
              <span><strong>{followingCount}</strong> <span className="text-gray-500">following</span></span>
            </div>
          </div>
          </div>
          <div className="flex gap-2">
            {currentUser && currentUser.id !== user.id && (
              <button
                onClick={async () => {
                  const res = await fetch('/api/messages/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                  });
                  const data = await res.json();
                  if (data.conversationId) dmRouter.push(`/messages/${data.conversationId}`);
                }}
                className="rounded-lg border px-4 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Message
              </button>
            )}
            <FollowButton targetUserId={user.id} />
          </div>
        </div>
        {user.koreanXIdentity && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{user.koreanXIdentity}</p>
        )}
        {user.interests.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <span key={interest} className="rounded-full bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Activity heatmap */}
      {Object.keys(activity).length > 0 && (
        <div className="mb-6">
          <ActivityHeatmap data={activity} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        <button
          onClick={() => setTab('posts')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'posts' ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
        >
          Posts
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`px-4 py-2 text-sm font-medium ${tab === 'comments' ? 'border-b-2 border-foreground' : 'text-gray-500'}`}
        >
          Comments
        </button>
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="mt-4 space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">No posts yet.</p>
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
                  <span title={new Date(post.createdAt).toLocaleString()}>{relativeTime(post.createdAt)}</span>
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
            <p className="text-sm text-gray-500">No comments yet.</p>
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
                  <span title={new Date(comment.createdAt).toLocaleString()}>{relativeTime(comment.createdAt)}</span>
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
