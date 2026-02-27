import { badRequest, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const url = request.nextUrl;
    const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
    const offset = Number(url.searchParams.get('offset') || 0);

    const members = await repo.listMembers(community.id, limit, offset);
    return NextResponse.json(members);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return badRequest(message);
  }
}
