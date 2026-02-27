import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    let membership = null;
    try {
      const userId = await requireUserId();
      const member = await repo.getMember(community.id, userId);
      if (member) {
        membership = { role: member.role, status: member.status };
      }
    } catch {
      // not authenticated — that's fine
    }

    return NextResponse.json({ ...community, membership });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return badRequest(message);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await requireUserId();
    const { slug } = await params;

    const community = await repo.findBySlug(slug);
    if (!community) return notFound('Community not found');

    const member = await repo.getMember(community.id, userId);
    if (!member || member.role !== 'LEADER') return forbidden('Only the leader can update the community');

    const body = await request.json();
    await repo.update(community.id, {
      name: body.name,
      description: body.description,
      privacy: body.privacy,
      kakaoLink: body.kakaoLink,
    });

    const updated = await repo.findById(community.id);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
