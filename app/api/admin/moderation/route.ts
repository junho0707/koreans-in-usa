import { hideContent, unhideContent } from '@/src/application/use-cases/moderation/moderate-content';
import { PgModerationRepository } from '@/src/infrastructure/repositories/pg-moderation-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { requireAdmin } from '@/src/interfaces/http/require-admin';
import { badRequest, unauthorized, forbidden } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgModerationRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
    const offset = Number(searchParams.get('offset') ?? 0);

    const items = await repo.getReportedContent(limit, offset);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error';
    if (message === 'Not authenticated') return unauthorized(message);
    if (message === 'Admin access required') return forbidden(message);
    return badRequest(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    await requireAdmin(userId);

    const body = await request.json();
    const { action, targetType, targetId } = body;

    if (action === 'hide') {
      await hideContent(repo, targetType, Number(targetId));
    } else if (action === 'unhide') {
      await unhideContent(repo, targetType, Number(targetId));
    } else {
      return badRequest('Invalid action');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error';
    if (message === 'Not authenticated') return unauthorized(message);
    if (message === 'Admin access required') return forbidden(message);
    return badRequest(message);
  }
}
