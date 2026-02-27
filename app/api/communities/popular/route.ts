import { badRequest } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function GET(request: NextRequest) {
  try {
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || 6), 20);
    const communities = await repo.listPopular(limit);
    return NextResponse.json(communities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return badRequest(message);
  }
}
