import { createPost } from '@/src/application/use-cases/community/create-post';
import { normalizePostType } from '@/src/domain/entities/post';
import { PgCommunityRepository } from '@/src/infrastructure/repositories/pg-community-repository';
import { requireUserId } from '@/src/interfaces/http/auth';
import { badRequest } from '@/src/interfaces/http/response';
import { NextRequest, NextResponse } from 'next/server';

const repo = new PgCommunityRepository();

export async function POST(request: NextRequest) {
  try {
    const userId = requireUserId(request);
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
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request');
  }
}
