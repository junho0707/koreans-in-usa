import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const url = request.nextUrl;
    const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
    const cursor = url.searchParams.get('cursor') || null;

    const posts = await repo.listUserCommunityFeed(userId, limit, cursor);
    return NextResponse.json(posts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
