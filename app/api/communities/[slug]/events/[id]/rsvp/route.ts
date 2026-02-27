import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { slug, id } = await params;

    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const member = await repo.getMember(community.id, userId);
    if (!member || member.status !== 'ACTIVE') return forbidden('You must be an active member to RSVP');

    const event = await repo.getEvent(Number(id));
    if (!event || event.communityId !== community.id) return notFound('Event not found');

    const body = await request.json();
    const status = body.status;
    if (!['GOING', 'MAYBE', 'NOT_GOING'].includes(status)) {
      return badRequest('Status must be GOING, MAYBE, or NOT_GOING');
    }

    await repo.upsertRsvp(event.id, userId, status);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
