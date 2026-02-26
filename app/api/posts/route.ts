import { createPost } from '@/src/application/use-cases/community/create-post';
import { autoTagPost } from '@/src/application/use-cases/tags/auto-tag-post';
import { addReputation } from '@/src/application/use-cases/user/update-reputation';
import { REP_POINTS } from '@/src/domain/services/reputation';
import { normalizePostType } from '@/src/domain/entities/post';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { PgTagRepository } from '@/src/infrastructure/repositories/pg-tag-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { checkRateLimit } from '@/src/interfaces/http/rate-limiter';
import { badRequest, unauthorized, tooManyRequests } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();
const tagRepo = new PgTagRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    if (!checkRateLimit(userId, 'posts')) {
      return tooManyRequests('Too many posts. Try again later.');
    }
    const body = await request.json();
    const created = await createPost(repo, {
      authorId: userId,
      type: normalizePostType(body.type),
      title: body.title,
      body: body.body,
      scopeUsa: Boolean(body.scopeUsa),
      scopeRegion: Boolean(body.scopeRegion),
      regionId: body.regionId ?? null,
      stateCode: body.stateCode ?? null,
      metroArea: body.metroArea ?? null,
      imageUrl: body.imageUrl ?? null,
    });

    // Auto-tag and add reputation in background (non-blocking)
    autoTagPost(tagRepo, created.id, body.title, body.body).catch(() => {});
    addReputation(userId, REP_POINTS.POST_CREATED).catch(() => {});

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    if (message === 'Not authenticated') return unauthorized(message);
    return badRequest(message);
  }
}
