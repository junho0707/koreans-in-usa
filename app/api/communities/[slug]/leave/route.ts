import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden, notFound } from '@/src/interfaces/http/response';
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

    const member = await repo.getMember(community.id, userId);
    if (!member) return badRequest('You are not a member');
    if (member.role === 'LEADER') return forbidden('Leaders cannot leave their community');

    await repo.removeMember(community.id, userId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
