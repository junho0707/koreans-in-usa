import { PgFollowRepository } from '@/src/infrastructure/repositories/pg-follow-repository';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgFollowRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = Number(id);
    if (!userId) return badRequest('Invalid user ID');

    const cursor = request.nextUrl.searchParams.get('cursor') ? Number(request.nextUrl.searchParams.get('cursor')) : undefined;
    const [counts, following] = await Promise.all([
      repo.getCounts(userId),
      repo.getFollowing(userId, cursor),
    ]);

    return NextResponse.json({ ...counts, ...following });
  } catch {
    return badRequest('Failed');
  }
}
