import { reportContent } from '@/src/application/use-cases/moderation/report-content';
import { PgModerationRepository } from '@/src/infrastructure/repositories/pg-moderation-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgModerationRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();

    if (!checkRateLimit(userId, 'reports')) {
      return tooManyRequests('Too many reports. Try again later.');
    }

    const body = await request.json();
    const result = await reportContent(
      repo,
      userId,
      body.targetType,
      Number(body.targetId),
      body.reason,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
