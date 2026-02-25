import { PgBookmarkRepository } from '@/src/infrastructure/repositories/pg-bookmark-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgBookmarkRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const postId = Number(request.nextUrl.searchParams.get('postId'));
    if (!postId) return badRequest('postId is required');

    const bookmarked = await repo.isBookmarked(userId, postId);
    return NextResponse.json({ bookmarked });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
