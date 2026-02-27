import { badRequest, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const event = await repo.getEvent(Number(id));
    if (!event || event.communityId !== community.id) return notFound('Event not found');

    const rsvps = await repo.listRsvps(event.id);
    const goingCount = await repo.getRsvpCount(event.id);

    return NextResponse.json({ ...event, rsvps, goingCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return badRequest(message);
  }
}
