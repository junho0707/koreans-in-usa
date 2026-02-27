import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest, unauthorized, forbidden } from '@/src/interfaces/http/response';
import { PgCommunitiesRepository } from '@/src/infrastructure/repositories/pg-communities-repository';
import { PgUserRepository } from '@/src/infrastructure/repositories/pg-user-repository';
import { COMMUNITY_CREATE_MIN_XP } from '@/src/domain/services/reputation';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunitiesRepository();
const userRepo = new PgUserRepository();

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
    const offset = Number(url.searchParams.get('offset') || 0);
    const search = url.searchParams.get('search') || '';
    const region = url.searchParams.get('region') || '';

    if (search) {
      const communities = await repo.searchByName(search, limit);
      return NextResponse.json(communities);
    }
    if (region) {
      const communities = await repo.listByRegion(region, limit, offset);
      return NextResponse.json(communities);
    }
    const communities = await repo.listPublic(limit, offset);
    return NextResponse.json(communities);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return badRequest(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const { name, description, scope, regionId, privacy, kakaoLink } = body;
    if (!name || !name.trim()) return badRequest('Name is required');

    const user = await userRepo.findById(userId);
    if (!user) return unauthorized('Not authenticated');
    if (user.reputation < COMMUNITY_CREATE_MIN_XP) {
      return forbidden(`You need at least ${COMMUNITY_CREATE_MIN_XP} XP to create a community`);
    }

    const count = await repo.countCreatedByUser(userId);
    if (count >= 3) return forbidden('You can create a maximum of 3 communities');

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const community = await repo.create({
      name: name.trim(),
      slug,
      description: description || null,
      scope: scope || 'USA',
      regionId: regionId || null,
      privacy: privacy || 'PUBLIC',
      leaderId: userId,
      kakaoLink: kakaoLink || null,
    });

    await repo.addMember(community.id, userId, 'LEADER', 'ACTIVE');

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
