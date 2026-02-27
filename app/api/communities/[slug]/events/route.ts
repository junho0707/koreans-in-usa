import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden, notFound } from '@/src/interfaces/http/response';
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

    const upcoming = request.nextUrl.searchParams.get('upcoming') !== 'false';
    const events = await repo.listEvents(community.id, upcoming);
    return NextResponse.json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return badRequest(message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await requireUserId();
    const { slug } = await params;

    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const member = await repo.getMember(community.id, userId);
    if (!member || member.status !== 'ACTIVE') return forbidden('You must be an active member to create events');

    const body = await request.json();
    if (!body.title || !body.eventDate) return badRequest('Title and event date are required');

    const event = await repo.createEvent({
      communityId: community.id,
      creatorId: userId,
      title: body.title,
      description: body.description || null,
      location: body.location || null,
      eventDate: body.eventDate,
      eventEndDate: body.eventEndDate || null,
      isOnline: Boolean(body.isOnline),
      maxAttendees: body.maxAttendees || 0,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
