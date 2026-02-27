import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  try {
    const currentUserId = await requireUserId();
    const { slug, userId: targetUserId } = await params;

    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const currentMember = await repo.getMember(community.id, currentUserId);
    if (!currentMember || (currentMember.role !== 'LEADER' && currentMember.role !== 'MODERATOR')) {
      return forbidden('Only leaders and moderators can approve members');
    }

    await repo.updateMemberStatus(community.id, Number(targetUserId), 'ACTIVE');

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
