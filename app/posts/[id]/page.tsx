'use client';

import { PostDetailView } from '@/src/components/post/post-detail-view';
import { PostActions } from '@/src/components/post/post-actions';
import { PostStats } from '@/src/components/post/post-stats';
import { PollWidget } from '@/src/components/post/poll-widget';
import { RelatedPosts } from '@/src/components/post/related-posts';
import { CommentThread } from '@/src/components/comments/comment-thread';
import { CommentForm } from '@/src/components/comments/comment-form';
import { CommentSortToggle } from '@/src/components/comments/comment-sort-toggle';
import { VoteButton } from '@/src/components/vote/vote-button';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import type { PostDetail } from '@/src/application/dto/post-detail';

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentSort, setCommentSort] = useState<'best' | 'new'>('best');

  const loadPost = useCallback(() => {
    fetch(`/api/posts/${id}?commentSort=${commentSort}`)
      .then((r) => {
        if (!r.ok) throw new Error('Post not found');
        return r.json();
      })
      .then((data) => setPost(data.post))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, commentSort]);

  useEffect(() => {
    loadPost();
    // Track view (fire and forget)
    fetch(`/api/posts/${id}/view`, { method: 'POST' }).catch(() => {});
  }, [loadPost, id]);

  async function handleAccept(commentId: number) {
    await fetch(`/api/posts/${id}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId }),
    });
    loadPost();
  }

  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8">Loading...</div>;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-8 text-red-600">{error}</div>;
  if (!post) return <div className="mx-auto max-w-3xl px-4 py-8">Post not found</div>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <VoteButton
          targetType="POST"
          targetId={post.id}
          initialScore={post.score}
          initialVoted={post.viewerVoted}
        />
      </div>

      <PostDetailView post={post} />

      <PostActions
        postId={post.id}
        postAuthorId={post.authorId}
        initialTitle={post.title}
        initialBody={post.body}
      />

      <PostStats postId={post.id} postAuthorId={post.authorId} />

      <PollWidget postId={post.id} />

      <hr className="my-8 border-gray-200 dark:border-gray-800" />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {post.commentCount} Comment{post.commentCount !== 1 ? 's' : ''}
        </h2>
        <CommentSortToggle sort={commentSort} onChange={setCommentSort} />
      </div>

      <div className="mb-6">
        <CommentForm postId={post.id} onSubmitted={loadPost} />
      </div>

      <CommentThread
        comments={post.comments}
        postId={post.id}
        acceptedCommentId={post.acceptedCommentId}
        postAuthorId={post.authorId}
        postType={post.type}
        onReplySubmitted={loadPost}
        onAccept={handleAccept}
      />

      <RelatedPosts postId={post.id} />
    </main>
  );
}
