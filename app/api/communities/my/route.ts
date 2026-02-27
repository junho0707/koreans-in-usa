import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function GET() {
  try {
    const userId = await requireUserId();
    const communities = await repo.listByUser(userId);
    return NextResponse.json(communities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
