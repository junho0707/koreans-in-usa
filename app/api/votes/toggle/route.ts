import { toggleVote } from '@/src/application/use-cases/community/toggle-vote';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { addReputation } from '@/src/application/use-cases/user/update-reputation';
import { REP_POINTS } from '@/src/domain/services/reputation';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/src/lib/db';

const repo = new PgCommunityRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    if (!checkRateLimit(userId, 'votes')) {
      return tooManyRequests('Too many votes. Try again later.');
    }
    const body = await request.json();
    const targetType = body.targetType as string;
    const targetId = Number(body.targetId);

    const result = await toggleVote(repo, {
      userId,
      targetType,
      targetId,
    });

    // Update reputation for content author (non-blocking)
    (async () => {
      try {
        const points = targetType === 'POST' ? REP_POINTS.POST_UPVOTED : REP_POINTS.COMMENT_UPVOTED;
        const table = targetType === 'POST' ? 'posts' : 'comments';
        const { rows } = await pool.query<Record<string, unknown>>(`SELECT author_id FROM ${table} WHERE id = $1`, [targetId]);
        if (rows[0] && Number(rows[0].author_id) !== userId) {
          const delta = result.voted ? points : -points;
          await addReputation(Number(rows[0].author_id), delta);
        }
      } catch {}
    })();

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
