import { toggleVote } from '@/src/application/use-cases/community/toggle-vote';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    if (!checkRateLimit(userId, 'votes')) {
      return tooManyRequests('Too many votes. Try again later.');
    }
    const body = await request.json();
    const result = await toggleVote(repo, {
      userId,
      targetType: body.targetType,
      targetId: Number(body.targetId),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
