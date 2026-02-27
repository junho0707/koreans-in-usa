import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden, notFound } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { pool } from '@/src/lib/db';
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

    if (community.privacy !== 'PUBLIC') {
      try {
        const userId = await requireUserId();
        const member = await repo.getMember(community.id, userId);
        if (!member || member.status !== 'ACTIVE') return forbidden('Members only');
      } catch {
        return forbidden('Members only');
      }
    }

    const url = request.nextUrl;
    const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
    const cursor = url.searchParams.get('cursor') || null;

    const posts = await repo.listCommunityPosts(community.id, limit, cursor);
    return NextResponse.json(posts);
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
    if (!member || member.status !== 'ACTIVE') return forbidden('You must be an active member to post');

    const body = await request.json();
    if (!body.title || !body.body) return badRequest('Title and body are required');

    const { rows } = await pool.query(
      `INSERT INTO posts (author_id, type, title, body, scope_usa, scope_region, community_id)
       VALUES ($1, 'GENERAL', $2, $3, false, false, $4) RETURNING id`,
      [userId, body.title, body.body, community.id]
    );

    return NextResponse.json({ id: (rows[0] as { id: number }).id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
