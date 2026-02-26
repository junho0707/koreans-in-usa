import { PgFollowRepository } from '@/src/infrastructure/repositories/pg-follow-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgFollowRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const targetId = Number(request.nextUrl.searchParams.get('userId'));
    if (!targetId) return badRequest('userId is required');

    const following = await repo.isFollowing(userId, targetId);
    return NextResponse.json({ following });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
