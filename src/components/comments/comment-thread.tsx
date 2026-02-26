'use client';

import { CommentNode } from '@/src/domain/entities/comment';
import { VoteButton } from '@/src/components/vote/vote-button';
import { CommentForm } from '@/src/components/comments/comment-form';
import { AcceptedBadge } from '@/src/components/comments/accepted-badge';
import { ReportButton } from '@/src/components/moderation/report-button';
import { Markdown } from '@/src/components/ui/markdown';
import { useAuth } from '@/src/components/providers/auth-context';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  comment: CommentNode;
  postId: number;
  depth?: number;
  acceptedCommentId?: number | null;
  postAuthorId?: number;
  postType?: string;
  onReplySubmitted?: () => void;
  onAccept?: (commentId: number) => void;
};

function CommentItem({
  comment,
  postId,
  depth = 0,
  acceptedCommentId,
  postAuthorId,
  postType,
  onReplySubmitted,
  onAccept,
}: Props) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const isAccepted = acceptedCommentId === comment.id;
  const canAccept = postType === 'QA' && user?.id === postAuthorId && !isAccepted;

  return (
    <div className={`${depth > 0 ? 'ml-4 border-l border-gray-200 pl-4 dark:border-gray-800' : ''}`}>
      <div className="py-2">
        {isAccepted && (
          <div className="mb-1">
            <AcceptedBadge />
          </div>
        )}
        <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
          <Link href={`/users/${comment.authorId}`} className="font-medium text-foreground hover:underline">{comment.authorDisplayName}</Link>
          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="mb-2 text-sm">
          <Markdown content={comment.body} />
        </div>
        <div className="flex items-center gap-3">
          <VoteButton
            targetType="COMMENT"
            targetId={comment.id}
            initialScore={comment.score}
            initialVoted={false}
          />
          <button
            onClick={() => setShowReply(!showReply)}
            className="text-xs text-gray-500 hover:text-foreground"
          >
            Reply
          </button>
          {canAccept && onAccept && (
            <button
              onClick={() => onAccept(comment.id)}
              className="text-xs text-green-600 hover:text-green-800"
            >
              Accept
            </button>
          )}
          <ReportButton targetType="COMMENT" targetId={comment.id} />
        </div>

        {showReply && (
          <div className="mt-2">
            <CommentForm
              postId={postId}
              parentCommentId={comment.id}
              onSubmitted={() => {
                setShowReply(false);
                onReplySubmitted?.();
              }}
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              acceptedCommentId={acceptedCommentId}
              postAuthorId={postAuthorId}
              postType={postType}
              onReplySubmitted={onReplySubmitted}
              onAccept={onAccept}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ThreadProps = {
  comments: CommentNode[];
  postId: number;
  acceptedCommentId?: number | null;
  postAuthorId?: number;
  postType?: string;
  onReplySubmitted?: () => void;
  onAccept?: (commentId: number) => void;
};

export function CommentThread({
  comments,
  postId,
  acceptedCommentId,
  postAuthorId,
  postType,
  onReplySubmitted,
  onAccept,
}: ThreadProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-gray-500">No comments yet.</p>;
  }

  return (
    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          acceptedCommentId={acceptedCommentId}
          postAuthorId={postAuthorId}
          postType={postType}
          onReplySubmitted={onReplySubmitted}
          onAccept={onAccept}
        />
      ))}
    </div>
  );
}
