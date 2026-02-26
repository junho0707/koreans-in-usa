import { setAcceptedAnswer } from '@/src/application/use-cases/post/set-accepted-answer';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { PgNotificationRepository } from '@/src/infrastructure/repositories/pg-notification-repository';
import { PgPostRepository } from '@/src/infrastructure/repositories/pg-post-repository';
import { addReputation } from '@/src/application/use-cases/user/update-reputation';
import { REP_POINTS } from '@/src/domain/services/reputation';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();
const notifRepo = new PgNotificationRepository();
const postRepo = new PgPostRepository();

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const postId = Number(id);
    const body = await request.json();

    const commentId = Number(body.commentId);
    await setAcceptedAnswer(repo, postId, commentId, userId);

    // Notify the comment author (non-blocking)
    (async () => {
      try {
        const comments = await postRepo.getCommentsByPostId(postId);
        const accepted = comments.find((c) => c.id === commentId);
        if (accepted && accepted.authorId !== userId) {
          await notifRepo.create({
            userId: accepted.authorId,
            type: 'ACCEPTED_ANSWER',
            actorId: userId,
            postId,
            commentId,
          });
          await addReputation(accepted.authorId, REP_POINTS.ANSWER_ACCEPTED);
        }
      } catch {}
    })();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const postId = Number(id);

    await setAcceptedAnswer(repo, postId, null, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
