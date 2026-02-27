import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await requireUserId();
    const { slug } = await params;

    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const existing = await repo.getMember(community.id, userId);
    if (existing) return badRequest('You are already a member or have a pending request');

    const status = community.privacy === 'PUBLIC' ? 'ACTIVE' : 'PENDING';
    await repo.addMember(community.id, userId, 'MEMBER', status);

    return NextResponse.json({ status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
