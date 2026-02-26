import { createComment } from '@/src/application/use-cases/community/create-comment';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { PgNotificationRepository } from '@/src/infrastructure/repositories/pg-notification-repository';
import { PgPostRepository } from '@/src/infrastructure/repositories/pg-post-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();
const notifRepo = new PgNotificationRepository();
const postRepo = new PgPostRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    if (!checkRateLimit(userId, 'comments')) {
      return tooManyRequests('Too many comments. Try again later.');
    }
    const body = await request.json();
    const postId = Number(body.postId);
    const parentCommentId = body.parentCommentId ? Number(body.parentCommentId) : null;

    const created = await createComment(repo, {
      authorId: userId,
      postId,
      parentCommentId,
      body: body.body,
    });

    // Send notifications (non-blocking)
    (async () => {
      try {
        if (parentCommentId) {
          // Reply to comment - notify parent comment author
          const comments = await postRepo.getCommentsByPostId(postId);
          const parent = comments.find((c) => c.id === parentCommentId);
          if (parent && parent.authorId !== userId) {
            await notifRepo.create({
              userId: parent.authorId,
              type: 'REPLY_TO_COMMENT',
              actorId: userId,
              postId,
              commentId: created.id,
            });
          }
        } else {
          // Comment on post - notify post author
          const post = await postRepo.getPostById(postId, null);
          if (post && post.authorId !== userId) {
            await notifRepo.create({
              userId: post.authorId,
              type: 'COMMENT_ON_POST',
              actorId: userId,
              postId,
              commentId: created.id,
            });
          }
        }
      } catch {
        // Notification failure should not affect comment creation
      }
    })();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
