import { PgFollowRepository } from '@/src/infrastructure/repositories/pg-follow-repository';
import { PgNotificationRepository } from '@/src/infrastructure/repositories/pg-notification-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgFollowRepository();
const notifRepo = new PgNotificationRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const targetId = Number(body.userId);
    if (!targetId) return badRequest('userId is required');

    const result = await repo.toggle(userId, targetId);

    // Notify on new follow (non-blocking)
    if (result.following) {
      notifRepo.create({
        userId: targetId,
        type: 'NEW_FOLLOWER',
        actorId: userId,
      }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
